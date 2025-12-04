import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS_FLAT,
} from "convex/lib/constants";
import { z } from "zod";

export const recipeEditSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  prepTime: z.number().int().min(0, "Prep time must be 0 or greater"),
  cookTime: z
    .number()
    .int()
    .min(0, "Cook time must be 0 or greater")
    .optional(),
  serves: z.number().int().min(1, "Must serve at least 1 person"),
  category: z.enum(RECIPE_CATEGORIES),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, "Ingredient name is required"),
      amount: z.number().min(0, "Amount must be 0 or greater").optional(),
      unit: z.enum(UNITS_FLAT).optional(),
      preparation: z.enum(PREPARATION_OPTIONS).optional(),
    })
  ),
  method: z.array(
    z.object({
      title: z.string().min(1, "Step title is required"),
      description: z.string().optional(),
      image: z.string().optional(), // Storage ID for the image
    })
  ),
});

export type RecipeEditFormData = z.infer<typeof recipeEditSchema>;
