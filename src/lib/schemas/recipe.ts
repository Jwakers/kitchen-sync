import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string().optional(),
  prepTime: z.number().min(1, "Prep time must be at least 1 minute"),
  cookTime: z.number().min(1, "Cook time must be at least 1 minute"),
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
  image: z.instanceof(File).optional(),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, "Ingredient name is required"),
      amount: z.string().optional(),
      unit: z.string().optional(),
      preparation: z.string().optional(),
    })
  ),
  method: z.array(
    z.object({
      title: z.string().min(1, "Step title is required"),
      description: z.string().optional(),
      image: z.instanceof(File).optional(),
    })
  ),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
