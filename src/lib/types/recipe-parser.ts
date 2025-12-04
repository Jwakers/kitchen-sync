import { Doc } from "convex/_generated/dataModel";
import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { z } from "zod";

/**
 * Shared type for structured ingredient (matches DB schema)
 */
export type StructuredIngredient = NonNullable<
  Doc<"recipes">["ingredients"]
>[number];

/**
 * Shared type for method step
 */
export type MethodStep = {
  title: string;
  description?: string;
};

/**
 * Shared type for nutrition information
 */
export type NutritionInfo = {
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;
};

/**
 * Base recipe type with core fields common to all parsed recipes
 */
export type ParsedRecipeBase = {
  title: string;
  description?: string;
  prepTime: number;
  cookTime: number;
  serves: number;
  category: (typeof RECIPE_CATEGORIES)[number];
  ingredients: StructuredIngredient[];
  method: MethodStep[];
  nutrition?: NutritionInfo;
};

/**
 * Complete parsed recipe for database (includes source metadata)
 */
export type ParsedRecipeForDB = ParsedRecipeBase & {
  imageUrl?: string;
  // Attribution & Source Information
  originalUrl?: string;
  originalAuthor?: string;
  importedAt?: number;
  originalPublishedDate?: string;
  rating?: {
    value?: string | number;
    count?: number;
  };
};

/**
 * Parsed recipe from text (requires nutrition, no source metadata)
 */
export type ParsedRecipeFromText = ParsedRecipeBase & {
  description: string; // Required for text parsing
  nutrition: Required<NutritionInfo>; // All nutrition fields required
};

// ============================================================================
// Shared Zod Schemas
// ============================================================================

/**
 * Zod schema for ingredient structure
 */
export const IngredientSchema = z.object({
  name: z.string(),
  amount: z.number().optional(),
  unit: z.string().optional(),
  preparation: z.string().optional(),
});

/**
 * Zod schema for method step structure
 */
export const MethodStepSchema = z.object({
  title: z.string().describe("Short descriptive title (3-5 words)"),
  description: z.string().describe("Complete instruction text"),
});

/**
 * Zod schema for nutrition information
 */
export const NutritionSchema = z.object({
  calories: z.number().int().optional(),
  protein: z.number().int().optional(),
  fat: z.number().int().optional(),
  carbohydrates: z.number().int().optional(),
});
