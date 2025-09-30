import { z } from "zod";

export const recipeEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  prepTime: z.number().min(0, "Prep time must be 0 or greater"),
  cookTime: z.number().min(0, "Cook time must be 0 or greater"),
  serves: z.number().min(1, "Must serve at least 1 person"),
  category: z.enum([
    "main",
    "dessert",
    "snack",
    "appetizer",
    "side",
    "beverage",
    "breakfast",
    "lunch",
    "dinner",
  ]),
});

export type RecipeEditFormData = z.infer<typeof recipeEditSchema>;
