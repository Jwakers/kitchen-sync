"use server";

import { Doc } from "convex/_generated/dataModel";
import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS_FLAT,
} from "convex/lib/constants";
import OpenAI from "openai";
import { z } from "zod";
import type { ParsedRecipeSchema } from "./get-recipe-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schemas for structured output
const IngredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string().optional(),
  preparation: z.string().optional(),
});

const MethodStepSchema = z.object({
  title: z.string().describe("Short descriptive title (3-5 words)"),
  description: z.string().describe("Complete original instruction text"),
});

const RecipeDataSchema = z.object({
  ingredients: z
    .array(IngredientSchema)
    .describe(
      "Parsed ingredients with amounts, units, and preparation methods"
    ),
  category: z.enum(RECIPE_CATEGORIES).describe("Recipe category"),
  method: z
    .array(MethodStepSchema)
    .describe("Method steps with titles and complete original descriptions"),
});

// Type for the structured ingredient output
type StructuredIngredient = NonNullable<Doc<"recipes">["ingredients"]>[number];

// Helper to validate and map units to canonical values
function validateUnit(unit?: string): (typeof UNITS_FLAT)[number] | undefined {
  if (!unit) return undefined;

  const normalized = unit.toLowerCase().trim();

  // Direct match
  if ((UNITS_FLAT as readonly string[]).includes(normalized)) {
    return normalized as (typeof UNITS_FLAT)[number];
  }

  // Common variations
  const unitMap: Record<string, (typeof UNITS_FLAT)[number]> = {
    cup: "cups",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    pound: "lbs",
    pounds: "lbs",
    lb: "lbs",
    ounce: "oz",
    ounces: "oz",
    gram: "g",
    grams: "g",
    kilogram: "kg",
    kilograms: "kg",
    milliliter: "ml",
    milliliters: "ml",
    liter: "l",
    liters: "l",
    gallon: "gal",
    gallons: "gal",
  };

  return unitMap[normalized];
}

// Helper to validate and map preparations to canonical values
function validatePreparation(
  prep?: string
): (typeof PREPARATION_OPTIONS)[number] | undefined {
  if (!prep) return undefined;

  const normalized = prep.toLowerCase().trim();

  // Direct match
  if ((PREPARATION_OPTIONS as readonly string[]).includes(normalized)) {
    return normalized as (typeof PREPARATION_OPTIONS)[number];
  }

  return undefined;
}

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
  if (lowerCategories.some((c) => c.includes("breakfast")))
    return "breakfast" as const;
  if (lowerCategories.some((c) => c.includes("lunch"))) return "lunch" as const;
  if (lowerCategories.some((c) => c.includes("dinner")))
    return "dinner" as const;
  if (lowerCategories.some((c) => c.includes("dessert")))
    return "dessert" as const;
  if (lowerCategories.some((c) => c.includes("appetizer")))
    return "appetizer" as const;
  if (lowerCategories.some((c) => c.includes("snack"))) return "snack" as const;
  if (lowerCategories.some((c) => c.includes("side"))) return "side" as const;
  if (
    lowerCategories.some((c) => c.includes("beverage") || c.includes("drink"))
  )
    return "beverage" as const;

  // Default to main if it's a main course or we can't determine
  return "main" as const;
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
  const systemPrompt = `You are an expert recipe parser. Parse the provided recipe data and return a JSON object with this exact structure:

{
  "ingredients": [
    {"name": "string", "amount": number, "unit": "string (optional)", "preparation": "string (optional)"}
  ],
  "category": "string (one of: ${RECIPE_CATEGORIES.join(", ")})",
  "method": [
    {"title": "string (3-5 words)", "description": "string (complete original instruction)"}
  ]
}

Available units: ${UNITS_FLAT.join(", ")}
Available preparations: ${PREPARATION_OPTIONS.join(", ")}

CRITICAL INSTRUCTIONS:

For ingredients:
- Extract numeric amount (convert fractions to decimals: 1/2 = 0.5)
- If amount is 0, missing, or unclear, use sensible defaults:
  * Fresh herbs (basil, parsley, cilantro, etc.): 1 handful
  * Spices/seasonings (salt, pepper, etc.): 1 pinch or to taste
  * Vegetables (onion, garlic, etc.): 1 unit
  * Other ingredients: estimate based on typical recipe amounts
- Match unit to available units (or omit if none matches)
- Extract ingredient name (without amount, unit, or preparation)
- Identify preparation method from available options (or omit if none matches)
- Remove parenthetical notes like "(28 ounce)" from the name
- Remove trailing text like "divided", "or to taste", "optional"

For category:
- Choose ONE category from the available categories that best fits this recipe

For method steps (VERY IMPORTANT):
- Keep ALL original instruction steps - DO NOT combine or condense them
- For EACH step, create a short descriptive title (3-5 words)
- PRESERVE the COMPLETE original instruction text in the "description" field
- DO NOT shorten, summarize, or paraphrase the original instruction text
- DO NOT merge multiple steps into one
- Titles should be action-oriented: "Prepare the sauce", "Brown the meat", "Preheat the oven"

You MUST return valid JSON.`;

  try {
    const categoryContext = Array.isArray(schemaCategory)
      ? schemaCategory.join(", ")
      : schemaCategory || "unknown";

    const userPrompt = `Recipe: ${recipeName}
${recipeDescription ? `Description: ${recipeDescription}` : ""}
Schema Category: ${categoryContext}

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join("\n")}

Instructions (${instructions.length} steps - KEEP ALL ${instructions.length} STEPS, DO NOT CONDENSE):
${instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}

IMPORTANT: Return exactly ${instructions.length} method steps. Copy each instruction text completely into the description field.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and accurate - best for structured parsing
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate with Zod
    const jsonData = JSON.parse(content);
    const validatedData = RecipeDataSchema.parse(jsonData);

    // Clean up and validate units and preparations
    const cleanedIngredients: StructuredIngredient[] =
      validatedData.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: validateUnit(ing.unit),
        preparation: validatePreparation(ing.preparation),
      }));

    return {
      ingredients: cleanedIngredients,
      category: validatedData.category,
      method: validatedData.method,
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
    category: category as (typeof RECIPE_CATEGORIES)[number],
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
