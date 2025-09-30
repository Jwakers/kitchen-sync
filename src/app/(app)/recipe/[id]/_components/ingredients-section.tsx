"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "convex/_generated/dataModel";

interface IngredientsSectionProps {
  recipe: Doc<"recipes">;
  isEditMode: boolean;
}

export function IngredientsSection({
  recipe,
  isEditMode,
}: IngredientsSectionProps) {
  if (isEditMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Ingredients editing will be implemented in the next phase.</p>
              <p className="text-sm">
                Currently showing {recipe.ingredients?.length || 0} ingredients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No ingredients added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="flex-1">
                {ingredient.amount} {ingredient.unit && `${ingredient.unit} `}
                {ingredient.preparation && `${ingredient.preparation} `}
                {/* Note: ingredient.name would come from ingredients table lookup */}
                Ingredient {index + 1}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
