"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "convex/_generated/dataModel";

interface MethodSectionProps {
  recipe: Doc<"recipes">;
  isEditMode: boolean;
}

export function MethodSection({ recipe, isEditMode }: MethodSectionProps) {
  if (isEditMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Instructions editing will be implemented in the next phase.</p>
              <p className="text-sm">
                Currently showing {recipe.method?.length || 0} steps.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recipe.method || recipe.method.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No instructions added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {recipe.method.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-foreground">{step.step}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
