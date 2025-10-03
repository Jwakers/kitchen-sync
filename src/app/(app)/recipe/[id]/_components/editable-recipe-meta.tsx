"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { titleCase } from "@/lib/utils";
import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { Calendar, Clock, Save, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Recipe } from "./recipe-client";
import { RecipeEditFormData } from "./schema";

interface EditableRecipeMetaProps {
  recipe: NonNullable<Recipe>;
  form: UseFormReturn<RecipeEditFormData>;
  onSave: (data: RecipeEditFormData) => void;
  onCancel: () => void;
}

export function EditableRecipeMeta({
  recipe,
  form,
  onSave,
  onCancel,
}: EditableRecipeMetaProps) {
  const prepTime = form.watch("prepTime");
  const cookTime = form.watch("cookTime");
  const totalTime =
    (prepTime ?? recipe.prepTime ?? 0) + (cookTime ?? recipe.cookTime ?? 0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Recipe Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    {...field}
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      field.onChange(v === "" ? undefined : parseInt(v, 10));
                    }}
                    placeholder="15"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    {...field}
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      field.onChange(v === "" ? undefined : parseInt(v, 10));
                    }}
                    placeholder="30"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serves"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serves</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    {...field}
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      field.onChange(v === "" ? undefined : parseInt(v, 10));
                    }}
                    placeholder="4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RECIPE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {titleCase(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{totalTime} minutes total</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              {new Date(
                recipe.updatedAt ?? recipe._creationTime
              ).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
