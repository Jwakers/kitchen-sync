"use client";

import { ParsedRecipeForDB } from "@/app/(app)/actions/parse-recipe-with-ai";
import { PreparationSelector } from "@/components/preparation-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
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
import { Textarea } from "@/components/ui/textarea";
import { UnitSelector } from "@/components/unit-selector";
import {
  importedRecipeSchema,
  type ImportedRecipeFormData,
} from "@/lib/schemas/imported-recipe";
import { titleCase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

type EditImportedRecipeProps = {
  recipe: ParsedRecipeForDB;
  onCancel: () => void;
  onSave: (recipe: ImportedRecipeFormData) => Promise<void>;
  isSaving: boolean;
};

export function EditImportedRecipe({
  recipe,
  onCancel,
  onSave,
  isSaving,
}: EditImportedRecipeProps) {
  const form = useForm<ImportedRecipeFormData>({
    resolver: zodResolver(importedRecipeSchema),
    defaultValues: {
      title: recipe.title,
      description: recipe.description || "",
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      serves: recipe.serves,
      category: recipe.category,
      ingredients: recipe.ingredients,
      method: recipe.method,
      nutrition: recipe.nutrition
        ? {
            calories: recipe.nutrition.calories || "",
            protein: recipe.nutrition.protein || "",
            fat: recipe.nutrition.fat || "",
            carbohydrates: recipe.nutrition.carbohydrates || "",
          }
        : undefined,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: methodFields,
    append: appendMethodStep,
    remove: removeMethodStep,
  } = useFieldArray({
    control: form.control,
    name: "method",
  });

  const onSubmit = async (values: ImportedRecipeFormData) => {
    // Preserve original source metadata that shouldn't be edited
    const recipeWithSourceData = {
      ...values,
      originalUrl: recipe.originalUrl,
      originalAuthor: recipe.originalAuthor,
      originalPublishedDate: recipe.originalPublishedDate,
    };
    await onSave(recipeWithSourceData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isSaving}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Edit Recipe</h2>
            <p className="text-sm text-muted-foreground">
              Make any necessary corrections before saving
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>Basic Information</h3>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your recipe"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Cook Time (min) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>Serves *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECIPE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {titleCase(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>Ingredients *</h3>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendIngredient({
                    name: "",
                    amount: 0,
                    unit: undefined,
                    preparation: undefined,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </Button>
            </div>

            {ingredientFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No ingredients added yet.</p>
                <p className="text-sm">
                  Click &ldquo;Add Ingredient&rdquo; to get started.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {ingredientFields.map((ingredient, index) => (
                <Card key={ingredient.id} className="p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground mt-2">
                      {index + 1}.
                    </span>
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Ingredient name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  {...field}
                                  onChange={(e) => {
                                    const v = Number(e.target.value);
                                    field.onChange(v);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <UnitSelector
                                  value={field.value || ""}
                                  onValueChange={field.onChange}
                                  placeholder="Unit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.preparation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <PreparationSelector
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="Prep"
                                  searchPlaceholder="Search..."
                                  emptyText="Not found"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Method */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>Method *</h3>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendMethodStep({
                    title: "",
                    description: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            {methodFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No method steps added yet.</p>
                <p className="text-sm">
                  Click &ldquo;Add Step&rdquo; to get started.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {methodFields.map((step, index) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground mt-2">
                      {index + 1}.
                    </span>
                    <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`method.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Step title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`method.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describe this step..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMethodStep(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>Nutrition Information (Optional)</h3>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="nutrition.calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input placeholder="250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nutrition.protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nutrition.fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nutrition.carbohydrates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Source Information (Read-only) */}
        {(recipe.originalUrl ||
          recipe.originalAuthor ||
          recipe.originalPublishedDate) && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Source Information</h3>
              <p className="text-xs text-muted-foreground">
                This information is from the original source and cannot be
                edited
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.originalAuthor && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Original Author
                  </p>
                  <p className="text-sm">{recipe.originalAuthor}</p>
                </div>
              )}
              {recipe.originalUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Original URL
                  </p>
                  <a
                    href={recipe.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {recipe.originalUrl}
                  </a>
                </div>
              )}
              {recipe.originalPublishedDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Original Published Date
                  </p>
                  <p className="text-sm">
                    {new Date(
                      recipe.originalPublishedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-background pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Recipe"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
