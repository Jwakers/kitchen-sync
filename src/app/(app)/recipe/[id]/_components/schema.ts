import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { z } from "zod";

export const recipeEditSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  prepTime: z.number().int().min(0, "Prep time must be 0 or greater"),
  cookTime: z.number().int().min(0, "Cook time must be 0 or greater"),
  serves: z.number().int().min(1, "Must serve at least 1 person"),
  category: z.enum(RECIPE_CATEGORIES),
});

export type RecipeEditFormData = z.infer<typeof recipeEditSchema>;
