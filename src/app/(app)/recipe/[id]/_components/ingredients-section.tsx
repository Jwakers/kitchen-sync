"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREPARATION_OPTIONS, UNITS_FLAT } from "convex/lib/constants";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Recipe } from "./recipe-client";
import { RecipeEditFormData } from "./schema";

interface IngredientsSectionProps {
  recipe: Recipe;
  isEditMode: boolean;
  form?: UseFormReturn<RecipeEditFormData>;
}

export function IngredientsSection({
  recipe,
  isEditMode,
  form,
}: IngredientsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "ingredients",
  });

  if (isEditMode && form) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Ingredients</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "",
                amount: 0,
                unit: undefined,
                preparation: undefined,
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground text-sm">
                No ingredients yet. Click &quot;Add&quot; to add one.
              </p>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-5">
                    <Label
                      htmlFor={`ingredients.${index}.name`}
                      className="text-xs"
                    >
                      Name
                    </Label>
                    <Input
                      id={`ingredients.${index}.name`}
                      {...form.register(`ingredients.${index}.name`)}
                      placeholder="e.g., onion"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label
                      htmlFor={`ingredients.${index}.amount`}
                      className="text-xs"
                    >
                      Amount
                    </Label>
                    <Input
                      id={`ingredients.${index}.amount`}
                      type="number"
                      step="0.01"
                      {...form.register(`ingredients.${index}.amount`, {
                        valueAsNumber: true,
                      })}
                      placeholder="2"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label
                      htmlFor={`ingredients.${index}.unit`}
                      className="text-xs"
                    >
                      Unit
                    </Label>
                    <Select
                      value={form.watch(`ingredients.${index}.unit`) || "none"}
                      onValueChange={(value) =>
                        form.setValue(
                          `ingredients.${index}.unit`,
                          value === "none"
                            ? undefined
                            : (value as (typeof UNITS_FLAT)[number])
                        )
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {UNITS_FLAT.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label
                      htmlFor={`ingredients.${index}.preparation`}
                      className="text-xs"
                    >
                      Prep
                    </Label>
                    <Select
                      value={
                        form.watch(`ingredients.${index}.preparation`) || "none"
                      }
                      onValueChange={(value) =>
                        form.setValue(
                          `ingredients.${index}.preparation`,
                          value === "none"
                            ? undefined
                            : (value as (typeof PREPARATION_OPTIONS)[number])
                        )
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Prep" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {PREPARATION_OPTIONS.map((prep) => (
                          <SelectItem key={prep} value={prep}>
                            {prep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recipe?.ingredients || recipe.ingredients.length === 0) {
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
                {ingredient.amount}
                {ingredient.unit ?? ""} {ingredient.name}{" "}
                {ingredient.preparation ? `- ${ingredient.preparation}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
