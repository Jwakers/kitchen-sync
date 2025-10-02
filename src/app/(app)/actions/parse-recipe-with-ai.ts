"use server";

import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS_FLAT,
} from "convex/lib/constants";
import OpenAI from "openai";
import type { ParsedRecipeSchema } from "./get-recipe-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for the structured ingredient output
type StructuredIngredient = {
  name: string;
  amount: number;
  unit?: (typeof UNITS_FLAT)[number];
  preparation?: (typeof PREPARATION_OPTIONS)[number];
};

// Type for the complete parsed recipe ready for Convex
export type ParsedRecipeForDB = {
  title: string;
  description?: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  serves: number;
  category: (typeof RECIPE_CATEGORIES)[number];
  ingredients: StructuredIngredient[];
  method: Array<{
    title: string;
    description?: string;
  }>;
  // Attribution & Source Information
  originalUrl?: string; // URL where recipe was imported from
  originalAuthor?: string; // Original recipe author/creator
  importedAt?: number; // Timestamp when recipe was imported
  originalPublishedDate?: string; // Original publication date from source
  // Additional metadata from source
  nutrition?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
  };
  rating?: {
    value?: string | number; // Rating value (e.g., 4.8)
    count?: number; // Number of ratings/reviews
  };
};

/**
 * Converts ISO 8601 duration to minutes
 * Examples: "PT30M" -> 30, "PT1H30M" -> 90, "PT2H" -> 120
 */
function parseDuration(duration?: string): number {
  if (!duration) return 0;

  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
}

/**
 * Extracts serving count from recipeYield string
 * Examples: "12" -> 12, "Serves 4" -> 4, "4-6 servings" -> 4
 */
function parseServings(recipeYield?: string): number {
  if (!recipeYield) return 4; // Default

  const match = recipeYield.match(/(\d+)/);
  return match ? parseInt(match[1]) : 4;
}

/**
 * Maps recipe category from schema.org to our app categories
 */
function mapCategory(
  schemaCategory?: string | string[]
): (typeof RECIPE_CATEGORIES)[number] {
  const categories = Array.isArray(schemaCategory)
    ? schemaCategory
    : schemaCategory
      ? [schemaCategory]
      : [];

  const lowerCategories = categories.map((c) => c.toLowerCase());

  // Try to match to our categories
  if (lowerCategories.some((c) => c.includes("breakfast"))) return "breakfast";
  if (lowerCategories.some((c) => c.includes("lunch"))) return "lunch";
  if (lowerCategories.some((c) => c.includes("dinner"))) return "dinner";
  if (lowerCategories.some((c) => c.includes("dessert"))) return "dessert";
  if (lowerCategories.some((c) => c.includes("appetizer"))) return "appetizer";
  if (lowerCategories.some((c) => c.includes("snack"))) return "snack";
  if (lowerCategories.some((c) => c.includes("side"))) return "side";
  if (
    lowerCategories.some((c) => c.includes("beverage") || c.includes("drink"))
  )
    return "beverage";

  // Default to main if it's a main course or we can't determine
  return "main";
}

/**
 * Uses GPT-4o-mini to parse recipe data with AI
 */
async function parseRecipeDataWithAI(
  recipeName: string,
  recipeDescription: string | undefined,
  schemaCategory: string | string[] | undefined,
  ingredients: string[],
  instructions: string[]
): Promise<{
  ingredients: StructuredIngredient[];
  category: (typeof RECIPE_CATEGORIES)[number];
  method: Array<{ title: string; description?: string }>;
} | null> {
  const systemPrompt = `You are an expert recipe parser. Parse the provided recipe data into a structured format.

Available units: ${UNITS_FLAT.join(", ")}
Available preparations: ${PREPARATION_OPTIONS.join(", ")}
Available categories: ${RECIPE_CATEGORIES.join(", ")}

Your task:
1. Parse ingredients into structured format
2. Determine the best category for this recipe
3. Convert instructions into method steps with descriptive titles

For ingredients:
- Extract numeric amount (convert fractions to decimals: 1/2 = 0.5)
- Match unit to available units (or omit if none matches)
- Extract ingredient name (without amount, unit, or preparation)
- Identify preparation method from available options (or omit if none matches)
- Remove parenthetical notes like "(28 ounce)" from the name
- Remove trailing text like "divided", "or to taste", "optional"

For category:
- Choose ONE category from the available categories that best fits this recipe
- Consider the recipe name, description, and ingredients

For method:
- Create concise, descriptive titles for each step (not just "Step 1", "Step 2")
- Keep the original instruction text as the description
- Titles should be action-oriented (e.g., "Prepare the sauce", "Cook the meat", "Assemble the dish")

Return JSON in this format:
{
  "ingredients": [{"name": "...", "amount": 1.5, "unit": "cups", "preparation": "chopped"}],
  "category": "dinner",
  "method": [{"title": "Prepare ingredients", "description": "..."}]
}`;

  try {
    const categoryContext = Array.isArray(schemaCategory)
      ? schemaCategory.join(", ")
      : schemaCategory || "unknown";

    const userPrompt = `Recipe: ${recipeName}
${recipeDescription ? `Description: ${recipeDescription}` : ""}
Schema Category: ${categoryContext}

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join("\n")}

Instructions:
${instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Lower for faster, more deterministic responses
      max_tokens: 2000, // Limit response size for speed
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);

    return {
      ingredients: parsed.ingredients || [],
      category: parsed.category || "main",
      method: parsed.method || [],
    };
  } catch (error) {
    console.error("Error parsing recipe with AI:", error);
    return null;
  }
}

/**
 * Parses recipe schema data into a format ready for your Convex database
 * Uses AI for intelligent parsing of ingredients, category, and method
 */
export async function parseRecipeWithAI(
  schema: ParsedRecipeSchema,
  originalUrl?: string
): Promise<ParsedRecipeForDB | null> {
  if (!schema.name) {
    return null;
  }

  const ingredientStrings = schema.recipeIngredient || [];
  const instructionStrings = schema.recipeInstructions || [];

  // Parse with AI
  const aiResult = await parseRecipeDataWithAI(
    schema.name,
    schema.description,
    schema.recipeCategory,
    ingredientStrings,
    instructionStrings
  );

  // Fallback to rule-based parsing if AI fails
  const ingredients =
    aiResult?.ingredients ||
    ingredientStrings.map((ing) => ({ name: ing, amount: 1 }));

  const category = aiResult?.category || mapCategory(schema.recipeCategory);

  const method =
    aiResult?.method ||
    instructionStrings.map((instruction, index) => ({
      title: `Step ${index + 1}`,
      description: instruction,
    }));

  const recipe: ParsedRecipeForDB = {
    title: schema.name,
    description: schema.description,
    prepTime: parseDuration(schema.prepTime),
    cookTime: parseDuration(schema.cookTime),
    serves: parseServings(schema.recipeYield),
    category,
    ingredients,
    method,
    // Attribution & Source Information
    originalUrl,
    originalAuthor: schema.author,
    importedAt: Date.now(), // Current timestamp when recipe is imported
    originalPublishedDate: schema.datePublished,
    // Additional metadata
    nutrition: schema.nutrition,
    rating: schema.aggregateRating
      ? {
          value: schema.aggregateRating.ratingValue,
          count: schema.aggregateRating.reviewCount,
        }
      : undefined,
  };

  return recipe;
}
