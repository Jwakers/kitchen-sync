"use client";

import { Nutrition } from "@/app/(app)/_components.tsx/nutrition";
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
        <Nutrition nutrition={recipe.nutrition} />
      </CardContent>
    </Card>
  );
}
