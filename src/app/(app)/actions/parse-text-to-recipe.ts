"use server";

import {
  IngredientSchema,
  MethodStepSchema,
  type ParsedRecipeFromText,
  type StructuredIngredient,
} from "@/lib/types/recipe-parser";
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
import { TEXT_RECIPE_PARSING_SCHEMA } from "./shared-recipe-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for text recipe parsing (all fields required per structured outputs)
const TextRecipeSchema = z.object({
  success: z.boolean(),
  errorMessage: z.string(),
  title: z.string(),
  description: z.string(),
  prepTime: z.number(),
  cookTime: z.number(),
  serves: z.number(),
  category: z.enum(RECIPE_CATEGORIES),
  ingredients: z.array(IngredientSchema),
  method: z.array(MethodStepSchema),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    fat: z.number(),
    carbohydrates: z.number(),
  }),
});

/**
 * Parses raw text into a structured recipe using AI (includes validation)
 * Single AI call handles both validation and parsing for better performance
 * Uses OpenAI structured outputs for guaranteed schema compliance
 */
async function parseTextWithAI(text: string): Promise<
  | { success: true; recipe: ParsedRecipeFromText }
  | {
      success: false;
      error: string;
      partialRecipe?: Partial<ParsedRecipeFromText>;
    }
> {
  // Generate units string from constants
  const unitsString = `Available units (CHOOSE FROM THESE ONLY): 
  Volume: ${UNITS.volume.join(", ")}
  Weight: ${UNITS.weight.join(", ")}
  Count: ${UNITS.count.join(", ")}
  Items: ${UNITS.items.join(", ")}`;

  // Generate preparations string from constants
  const preparationsString = `Available preparations (CHOOSE FROM THESE ONLY - if no exact match, omit preparation): 
  ${PREPARATION_OPTIONS.join(", ")}`;

  const systemPrompt = `You are an expert recipe parser and validator. First, determine if the provided text is a recipe with enough information. Then parse it if valid.

CRITICAL: If the text is NOT a recipe or lacks sufficient information:
- Set "success" to false
- Provide a clear "errorMessage" explaining why (e.g., "This looks like a shopping list, not a recipe" or "Not enough information - please include cooking instructions")
- Set all other fields to empty/default values:
  * title: "" (empty string)
  * description: "" (empty string)
  * prepTime: 0
  * cookTime: 0
  * serves: 4
  * category: "main"
  * ingredients: [] (empty array)
  * method: [] (empty array)
  * nutrition: {calories: 0, protein: 0, fat: 0, carbohydrates: 0}

If the text IS a valid recipe, set "success" to true, set "errorMessage" to "" (empty string), and provide all fields with actual data.

Return JSON with ALL fields always present:
{
  "success": boolean,
  "errorMessage": "string" (empty string if success is true, error message if false),
  "title": "string",
  "description": "string",
  "prepTime": number,
  "cookTime": number,
  "serves": number,
  "category": "string (one of: ${RECIPE_CATEGORIES.join(", ")})",
  "ingredients": [...],
  "method": [...],
  "nutrition": {...}
}

A text is a valid recipe if it has:
- At least 2-3 ingredients (or clear ingredient information)
- Some form of cooking/preparation instructions
- Enough context to understand what dish is being made

NOT valid recipes:
- Shopping lists without preparation context
- Restaurant menus
- Food reviews or descriptions without recipes
- Vague or incomplete information

${unitsString}

${preparationsString}

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:

For title (REQUIRED):
- If the recipe name is mentioned, use it
- If not explicitly stated, create a descriptive name based on the dish (e.g., "Classic Tomato Pasta", "Chocolate Chip Cookies")
- NEVER leave this empty or undefined

For description (REQUIRED):
- If a description exists, use it
- If not, generate an engaging 2-3 sentence description highlighting key flavors, occasion, or what makes it special
- Make it appetizing and informative
- NEVER leave this empty or undefined

For timing (REQUIRED):
- Extract prep and cook times if mentioned
- If not stated, estimate reasonable times based on the recipe complexity and ingredients
- prepTime and cookTime MUST be numbers (not undefined)
- Use 0 for cookTime if it's a no-cook recipe

For ingredients (CRITICAL - EVERY INGREDIENT MUST BE COMPLETE):
- EVERY ingredient MUST have a "name" field - NEVER leave it undefined
- Extract numeric amount (convert fractions: 1/2 = 0.5, 1/4 = 0.25, 1/3 = 0.33)
- If an ingredient is unclear or incomplete, DO NOT include it in the list
- ALWAYS try to match units to available units above
- CRITICALLY IMPORTANT: Extract preparation terms from ingredient text and match to available preparations
  * Look for words like "frozen", "fresh", "dried", "whole", "toasted", "room temperature", "softened", "melted", "chopped", "diced", "sliced", etc.
  * The "name" field should contain ONLY the ingredient name itself (e.g., "chicken breast" not "frozen chicken breast")
  * ONLY use preparations from the "Available preparations" list above
  * If the preparation term doesn't exactly match an available option, omit it rather than making up a preparation
  * Multiple preparations can be combined with commas (e.g., "peeled, chopped")
  * Remove preparation terms from the ingredient name
- If amounts are vague, use sensible defaults (garlic: 2-4 cloves, herbs: 1 bunch, seasonings: 1 tsp)
- Remove parenthetical notes like "(28 ounce)" from the name
- Remove trailing text like "divided", "or to taste", "optional"
- Quality over quantity - better to have fewer complete ingredients than many with missing names

For method (REQUIRED):
- Break down into clear steps
- Create short action-oriented titles
- Provide complete instructions in description
- MUST have at least one step

For nutrition (ALWAYS REQUIRED - ALL FOUR FIELDS):
- calories: REQUIRED (must be a number, not undefined)
- protein: REQUIRED (must be a number in grams, not undefined)
- fat: REQUIRED (must be a number in grams, not undefined)
- carbohydrates: REQUIRED (must be a number in grams, not undefined)
- If nutrition facts are provided in the text, use them
- If NOT provided, calculate estimates based on the ingredients:
  * Consider all ingredients and their quantities
  * Account for cooking methods (frying adds fat, etc.)
  * Use standard USDA values for common ingredients
  * Return integers (whole numbers)
  * ALL FOUR values must be present
- NEVER leave any nutrition field undefined

You MUST return valid JSON with ALL fields present.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this recipe:\n\n${text}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe_parser",
          strict: true,
          schema: TEXT_RECIPE_PARSING_SCHEMA,
        },
      },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON (structured outputs ensures valid JSON)
    const jsonData = JSON.parse(content);
    const validationResult = TextRecipeSchema.safeParse(jsonData);

    if (!validationResult.success) {
      console.error("Zod validation failed:", validationResult.error);

      // Try to extract whatever partial data we can for edit mode
      const partialData = extractPartialRecipeData(jsonData);
      if (partialData) {
        return {
          success: false,
          error:
            "The AI returned incomplete data. Please complete the missing fields in edit mode.",
          partialRecipe: partialData,
        };
      }

      return {
        success: false,
        error:
          "The AI returned incomplete recipe data. Please try again with more detailed recipe information.",
      };
    }

    const validatedData = validationResult.data;

    // Check if validation failed
    if (!validatedData.success) {
      return {
        success: false,
        error:
          validatedData.errorMessage ||
          "This doesn't look like a recipe. Please include ingredients and cooking steps.",
      };
    }

    // Check if we have enough data for a valid recipe (ingredients and method are critical)
    if (
      validatedData.ingredients.length === 0 ||
      validatedData.method.length === 0
    ) {
      console.error("Missing critical recipe data:", {
        ingredientsCount: validatedData.ingredients.length,
        methodStepsCount: validatedData.method.length,
      });

      // Try to use partial data for edit mode if we have some data
      const partialData = extractPartialRecipeData(jsonData);
      if (
        partialData &&
        (partialData.ingredients?.length || partialData.method?.length)
      ) {
        return {
          success: false,
          error:
            "The AI couldn't extract all recipe details. Please complete the missing fields in edit mode.",
          partialRecipe: partialData,
        };
      }

      return {
        success: false,
        error:
          "The AI couldn't extract enough recipe information. Please provide more details.",
      };
    }

    // Clean up and validate units and preparations
    const cleanedIngredients: StructuredIngredient[] =
      validatedData.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: validateUnit(ing.unit),
        preparation: validatePreparation(ing.preparation),
      }));

    return {
      success: true,
      recipe: {
        title: validatedData.title,
        description: validatedData.description,
        prepTime: validatedData.prepTime,
        cookTime: validatedData.cookTime,
        serves: validatedData.serves,
        category: validatedData.category,
        ingredients: cleanedIngredients,
        method: validatedData.method,
        nutrition: validatedData.nutrition,
      },
    };
  } catch (error) {
    console.error("Error parsing text with AI:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Extracts whatever partial recipe data we can from incomplete AI response
 * This allows users to edit and complete the recipe manually
 */
function extractPartialRecipeData(
  jsonData: unknown
): Partial<ParsedRecipeFromText> | null {
  try {
    if (!jsonData || typeof jsonData !== "object") {
      return null;
    }

    const data = jsonData as Record<string, unknown>;
    const partial: Partial<ParsedRecipeFromText> = {};

    // Extract whatever we can
    if (data.title && typeof data.title === "string") {
      partial.title = data.title;
    }
    if (data.description && typeof data.description === "string") {
      partial.description = data.description;
    }
    if (typeof data.prepTime === "number") {
      partial.prepTime = data.prepTime;
    }
    if (typeof data.cookTime === "number") {
      partial.cookTime = data.cookTime;
    }
    if (typeof data.serves === "number") {
      partial.serves = data.serves;
    }
    if (data.category && typeof data.category === "string") {
      partial.category = data.category as (typeof RECIPE_CATEGORIES)[number];
    }

    // Extract ingredients (only complete ones)
    if (Array.isArray(data.ingredients)) {
      const validIngredients = data.ingredients
        .filter(
          (ing: unknown): ing is { name: string; amount: number } =>
            typeof ing === "object" &&
            ing !== null &&
            "name" in ing &&
            typeof ing.name === "string" &&
            "amount" in ing &&
            typeof ing.amount === "number"
        )
        .map((ing) => ({
          name: ing.name,
          amount: ing.amount,
          unit: validateUnit(
            "unit" in ing && typeof ing.unit === "string" ? ing.unit : undefined
          ),
          preparation: validatePreparation(
            "preparation" in ing && typeof ing.preparation === "string"
              ? ing.preparation
              : undefined
          ),
        }));

      if (validIngredients.length > 0) {
        partial.ingredients = validIngredients;
      }
    }

    // Extract method steps
    if (Array.isArray(data.method)) {
      const validSteps = data.method
        .filter(
          (step: unknown): step is { title: string } =>
            typeof step === "object" &&
            step !== null &&
            "title" in step &&
            typeof step.title === "string"
        )
        .map((step) => ({
          title: step.title,
          description:
            "description" in step && typeof step.description === "string"
              ? step.description
              : undefined,
        }));

      if (validSteps.length > 0) {
        partial.method = validSteps;
      }
    }

    // Extract nutrition
    if (data.nutrition && typeof data.nutrition === "object") {
      const nutritionData = data.nutrition as Record<string, unknown>;
      const nutrition: Partial<Required<ParsedRecipeFromText["nutrition"]>> =
        {};

      if (typeof nutritionData.calories === "number") {
        nutrition.calories = nutritionData.calories;
      }
      if (typeof nutritionData.protein === "number") {
        nutrition.protein = nutritionData.protein;
      }
      if (typeof nutritionData.fat === "number") {
        nutrition.fat = nutritionData.fat;
      }
      if (typeof nutritionData.carbohydrates === "number") {
        nutrition.carbohydrates = nutritionData.carbohydrates;
      }

      if (Object.keys(nutrition).length > 0) {
        partial.nutrition = nutrition as Required<
          ParsedRecipeFromText["nutrition"]
        >;
      }
    }

    // Only return if we got at least some meaningful data
    if (Object.keys(partial).length >= 2) {
      return partial;
    }

    return null;
  } catch (error) {
    console.error("Error extracting partial data:", error);
    return null;
  }
}

/**
 * Main function to parse text into a recipe
 * Single AI call handles both validation and parsing
 */
export async function parseTextToRecipe(text: string): Promise<{
  success: boolean;
  recipe?: ParsedRecipeFromText;
  partialRecipe?: Partial<ParsedRecipeFromText>;
  error?: string;
}> {
  // Trim and validate input
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      success: false,
      error: "Please enter some recipe text",
    };
  }

  if (trimmedText.length < 50) {
    return {
      success: false,
      error:
        "We need a bit more information. Please add at least a few sentences about your recipe.",
    };
  }

  if (trimmedText.length > 6000) {
    return {
      success: false,
      error: "That's a lot of text! Please keep it under 6,000 characters.",
    };
  }

  // Single AI call validates and parses in one step
  const result = await parseTextWithAI(trimmedText);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      partialRecipe: result.partialRecipe,
    };
  }

  return {
    success: true,
    recipe: result.recipe,
  };
}
