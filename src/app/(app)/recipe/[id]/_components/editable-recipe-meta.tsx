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
import { Doc } from "convex/_generated/dataModel";
import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { Calendar, Clock, Save, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";

interface EditableRecipeMetaProps {
  recipe: Doc<"recipes">;
  form: UseFormReturn<RecipeEditFormData>;
  onSave: (data: RecipeEditFormData) => void;
  onCancel: () => void;
}

const recipeEditSchema = z.object({
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

type RecipeEditFormData = z.infer<typeof recipeEditSchema>;

export function EditableRecipeMeta({
  recipe,
  form,
  onSave,
  onCancel,
}: EditableRecipeMetaProps) {
  const prepTime = form.watch("prepTime");
  const cookTime = form.watch("cookTime");
  const totalTime =
    (prepTime || recipe.prepTime) + (cookTime || recipe.cookTime);

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
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
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
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
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
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
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
              {new Date(recipe.updatedAt).toLocaleDateString()}
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
          <Button
            type="submit"
            className="gap-2"
            onClick={form.handleSubmit(onSave)}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
