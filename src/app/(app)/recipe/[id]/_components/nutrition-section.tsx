"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recipe } from "./recipe-client";

interface NutritionSectionProps {
  recipe: Recipe;
}

export function NutritionSection({ recipe }: NutritionSectionProps) {
  // If no nutrition data exists, don't render the section
  if (!recipe?.nutrition) {
    return null;
  }

  const { calories, protein, fat, carbohydrates } = recipe.nutrition;

  // Check if there's any actual nutrition data to display
  const hasNutritionData =
    calories !== undefined ||
    protein !== undefined ||
    fat !== undefined ||
    carbohydrates !== undefined;

  if (!hasNutritionData) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Nutrition Information</CardTitle>
        <p className="text-sm text-muted-foreground">Per serving</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {calories !== undefined && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{calories}</div>
              <div className="text-sm text-muted-foreground mt-1">Calories</div>
            </div>
          )}
          {protein !== undefined && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{protein}g</div>
              <div className="text-sm text-muted-foreground mt-1">Protein</div>
            </div>
          )}
          {carbohydrates !== undefined && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {carbohydrates}g
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Carbohydrates
              </div>
            </div>
          )}
          {fat !== undefined && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{fat}g</div>
              <div className="text-sm text-muted-foreground mt-1">Fat</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
