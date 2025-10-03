import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS_FLAT,
} from "convex/lib/constants";
import { z } from "zod";

// Schema that closely follows the createRecipe mutation args with additional validations
export const importedRecipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string().optional(),
  prepTime: z.number().min(1, "Prep time must be at least 1 minute"),
  cookTime: z.number().min(0, "Cook time must be 0 or greater").optional(),
  serves: z.number().min(1, "Must serve at least 1 person"),
  category: z.enum(RECIPE_CATEGORIES, {
    error: "Please select a valid category",
  }),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, "Ingredient name is required"),
        amount: z.number().min(0, "Amount must be a positive number"),
        unit: z.enum(UNITS_FLAT).optional(),
        preparation: z.enum(PREPARATION_OPTIONS).optional(),
      })
    )
    .min(1, "Must have at least 1 ingredient"),
  method: z
    .array(
      z.object({
        title: z.string().min(1, "Step title is required"),
        description: z.string().optional(),
      })
    )
    .min(1, "Must have at least 1 method step"),
  nutrition: z
    .object({
      calories: z.number().int().optional(),
      protein: z.number().int().optional(),
      fat: z.number().int().optional(),
      carbohydrates: z.number().int().optional(),
    })
    .optional(),
  // Source metadata fields - passed through but not editable by user
  originalUrl: z.string().optional(),
  originalAuthor: z.string().optional(),
  originalPublishedDate: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ImportedRecipeFormData = z.infer<typeof importedRecipeSchema>;
