"use server";

import {
  IngredientSchema,
  MethodStepSchema,
  type ParsedRecipeForDB,
  type StructuredIngredient,
} from "@/lib/types/recipe-parser";
import {
  mapCategory,
  parseDuration,
  parseNutritionData,
  parseServings,
} from "@/lib/utils/recipe-parsing-helpers";
import {
  validatePreparation,
  validateUnit,
} from "@/lib/utils/recipe-validation";
import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS,
} from "convex/lib/constants";
import OpenAI from "openai";
import { z } from "zod";
import type { ParsedRecipeSchema } from "./get-recipe-schema";
import { BASE_RECIPE_PARSING_SCHEMA } from "./shared-recipe-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for AI-parsed recipe data
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
  // Generate units string from constants
  const unitsString = `Available units (CHOOSE FROM THESE ONLY): 
  Volume: ${UNITS.volume.join(", ")}
  Weight: ${UNITS.weight.join(", ")}
  Count: ${UNITS.count.join(", ")}
  Items: ${UNITS.items.join(", ")}`;

  // Generate preparations string from constants
  const preparationsString = `Available preparations (CHOOSE FROM THESE ONLY): 
  ${PREPARATION_OPTIONS.join(", ")}`;

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

${unitsString}

${preparationsString}

CRITICAL INSTRUCTIONS:

For ingredients:
- Extract numeric amount (convert fractions to decimals: 1/2 = 0.5, 1/4 = 0.25, 1/3 = 0.33)
- If amount is 0, missing, or unclear, use sensible defaults:
  * Garlic cloves: use "clove" unit, amount based on recipe (2-4 typical)
  * Fresh herbs (basil, parsley, cilantro): use "sprig" or "bunch" or "handful"
  * Spices/seasonings (salt, pepper): use "pinch" or "dash" or 1 tsp
  * Vegetables (onion): use "piece" or "whole" or standard weight
  * Canned/packaged items: use "can", "jar", "packet", etc.
  * Other ingredients: estimate based on typical recipe amounts
- ALWAYS try to match units to available units above
- For items like "2 chicken breasts" use amount: 2, unit: "breast"
- For items like "1 head of lettuce" use amount: 1, unit: "head"  
- Extract ingredient name (without amount, unit, or preparation)
- Identify preparation method from available options (or omit if none matches)
- Remove parenthetical notes like "(28 ounce)" from the name
- Remove trailing text like "divided", "or to taste", "optional"

For nutrition information (if available in the recipe data):
- Values should be returned as integers representing grams (for protein, fat, carbs) or units (for calories)
- If a range is present (e.g., "10-15g"), use the higher value or middle value if it's a wide range
- Convert units as needed (e.g., mg to g: divide by 1000)
- If nutrition values are unclear or missing, use your best judgment based on typical values for this type of recipe accounting for ingredients used
- Round up to the nearest whole number

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
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe_parser",
          strict: true,
          schema: BASE_RECIPE_PARSING_SCHEMA,
        },
      },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON (structured outputs ensures valid JSON)
    const jsonData = JSON.parse(content);
    const validationResult = RecipeDataSchema.safeParse(jsonData);

    if (!validationResult.success) {
      console.error("Schema validation failed:", validationResult.error);
      return null;
    }

    const validatedData = validationResult.data;

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
export async function parseRecipeSchemaWithAI(
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
    imageUrl: schema.image,
    ingredients,
    method,
    // Attribution & Source Information
    originalUrl,
    originalAuthor: schema.author,
    importedAt: Date.now(), // Current timestamp when recipe is imported
    originalPublishedDate: schema.datePublished,
    // Additional metadata - parse nutrition values to integers (grams)
    nutrition: parseNutritionData(schema.nutrition),
    rating: schema.aggregateRating
      ? {
          value: schema.aggregateRating.ratingValue,
          count: schema.aggregateRating.reviewCount,
        }
      : undefined,
  };

  return recipe;
}
