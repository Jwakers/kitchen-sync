"use client";

import { CATEGORY_COLORS, ROUTES } from "@/app/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { titleCase } from "@/lib/utils";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  ListChecks,
  Minus,
  Plus,
  Printer,
  Search,
  Share2,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Recipe = FunctionReturnType<typeof api.recipes.getAllUserRecipes>[number];

function RecipeSelectionCard({
  recipe,
  isSelected,
  onToggle,
}: {
  recipe: Recipe;
  isSelected: boolean;
  onToggle: (recipeId: Id<"recipes">) => void;
}) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
  const categoryLabel = titleCase(recipe.category);
  const categoryColor = CATEGORY_COLORS[recipe.category];
  const ingredientCount = recipe.ingredients?.length || 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isSelected && "ring-2 ring-primary shadow-xl"
      }`}
    >
      <div className="flex flex-col">
        {/* Main content area - clickable for selection */}
        <div
          className="flex gap-4 p-4 cursor-pointer"
          onClick={() => onToggle(recipe._id)}
        >
          {/* Recipe Image */}
          <div
            className={`relative size-24 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 ${
              isSelected ? "ring-2 ring-primary/50" : ""
            }`}
          >
            {recipe.image && (
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                sizes="96px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            )}
            {!recipe.image && (
              <div className="flex items-center justify-center h-full w-full">
                <ChefHat className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {isSelected && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {recipe.title}
              </h3>
              <Badge
                variant="secondary"
                className={`${categoryColor} border-0 shrink-0`}
              >
                {categoryLabel}
              </Badge>
            </div>

            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {recipe.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{totalTime}min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium">{recipe.serves}</span>
              </div>
              <div className="flex items-center gap-1">
                <ListChecks className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">
                  {ingredientCount} ingredients
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients preview section */}
        <Accordion type="single" collapsible className="border-t">
          <AccordionItem value="ingredients" className="border-0">
            <AccordionTrigger
              className="px-4 py-3 text-xs font-medium hover:no-underline hover:bg-muted/50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Preview Ingredients
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="space-y-1.5 bg-muted/30 p-3 rounded-md">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span className="font-medium">{ingredient.amount}</span>
                      {ingredient.unit && (
                        <span className="text-muted-foreground">
                          {ingredient.unit}
                        </span>
                      )}
                      <span>{ingredient.name}</span>
                      {ingredient.preparation && (
                        <span className="text-muted-foreground text-xs">
                          ({ingredient.preparation})
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No ingredients listed
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-20 w-20 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SelectedRecipesList({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Selected Recipes ({recipes.length})</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {recipes.map((recipe) => (
          <Badge key={recipe._id} variant="secondary" className="px-3 py-1">
            {recipe.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}

const parseRecipeIngredients = (recipe: Recipe) => {
  return recipe.ingredients?.map((ing) => ({
    recipeId: recipe._id,
    id: crypto.randomUUID(),
    ...ing,
  }));
};

function ShoppingList({
  onBack,
  recipes,
}: {
  onBack: () => void;
  recipes: Recipe[];
}) {
  const flatIngredients = useRef(
    recipes
      .flatMap(parseRecipeIngredients)
      .filter((item) => item !== undefined)
      .toSorted((a, b) => a.name.localeCompare(b.name))
  );

  const [allIngredients, setAllIngredients] = useState(flatIngredients.current);
  const [isFinalised, setIsFinalised] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleAmountChange = (id: string, newAmount: number) => {
    setAllIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: Math.max(0, newAmount) } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setAllIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckItem = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    setIsFinalised(true);
  };

  const handleEdit = () => {
    setIsFinalised(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    // Create a formatted text version of the shopping list
    const listText = `Created: ${new Date().toLocaleDateString()}\n\n${allIngredients
      .map((item) => {
        const checked = checkedItems.has(item.id) ? "✓ " : "";
        return `${checked}• ${item.amount} ${item.unit} ${item.name}`;
      })
      .join("\n")}`;

    // Check if Web Share API is available (primarily mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shopping List",
          text: listText,
        });
        toast.success("Shopping list shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share shopping list");
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(listText);
        toast.success("Shopping list copied to clipboard!");
      } catch {
        toast.error("Failed to copy shopping list");
      }
    }
  };

  const handleDoneShopping = () => {
    toast.success("Shopping complete! Happy cooking!");
    // Go back to recipe selection
    onBack();
  };

  return (
    <>
      {/* Print-only section */}
      <div className="hidden print:block">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
          <p className="text-gray-600 mb-6">
            From {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}:{" "}
            {recipes.map((r) => r.title).join(", ")}
          </p>

          <div className="space-y-1">
            {allIngredients.map((item) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2 border-b"
                >
                  <div className="w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5">
                    {isChecked && (
                      <div className="w-full h-full flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={isChecked ? "line-through text-gray-500" : ""}
                    >
                      {item.name}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {item.amount} {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Total items: {allIngredients.length}
          </p>
        </div>
      </div>

      {/* Screen view */}
      <div className="space-y-6 print:hidden">
        {/* Back/Edit Button */}
        {!isFinalised ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe Selection
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit Shopping List
          </Button>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">
                  {isFinalised ? "Your Shopping List" : "Review Shopping List"}
                </h3>
              </div>
              <Badge variant="outline" className="text-sm">
                {allIngredients.length} items
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {isFinalised ? (
                <>
                  Shopping list from {recipes.length}{" "}
                  {recipes.length === 1 ? "recipe" : "recipes"}. Check off items
                  as you shop.
                </>
              ) : (
                <>
                  Generated from {recipes.length}{" "}
                  {recipes.length === 1 ? "recipe" : "recipes"}. Adjust
                  quantities or remove items before confirming.
                </>
              )}
            </p>

            {/* Shopping guidance for finalized lists */}
            {isFinalised && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Ready to shop! Here&apos;s how to use your list:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Use in the app</p>
                      <p className="text-muted-foreground">
                        Check off items as you shop. Your progress is saved
                        automatically.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Print it out</p>
                      <p className="text-muted-foreground">
                        Get a clean, printer-friendly version to take to the
                        store.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Share as text</p>
                      <p className="text-muted-foreground">
                        Send to family, save as a note, or share via text
                        message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {allIngredients.map((item) => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isFinalised && isChecked
                        ? "bg-muted/50 opacity-60"
                        : "hover:bg-muted/30 hover:border-primary/30"
                    }`}
                  >
                    {/* Checkbox (only in finalized state) */}
                    {isFinalised && (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCheckItem(item.id)}
                        className="h-5 w-5"
                      />
                    )}

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-medium ${
                            isFinalised && isChecked ? "line-through" : ""
                          }`}
                        >
                          {item.name}
                        </p>
                        {/* {item.recipeId.length > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.recipeId} recipes
                        </Badge>
                      )} */}
                      </div>

                      {/* Amount Display/Controls */}
                      {isFinalised ? (
                        // Static display when finalized
                        <p className="text-sm text-muted-foreground">
                          {item.amount} {item.unit}
                        </p>
                      ) : (
                        // Editable controls before finalized
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-muted rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleAmountChange(item.id, item.amount - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleAmountChange(
                                  item.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-7 w-16 text-center border-0 bg-transparent p-0 text-sm font-medium"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleAmountChange(item.id, item.amount + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Remove Button (only in editing state) */}
                    {!isFinalised && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove {item.name}</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {allIngredients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  All items removed. Go back to select recipes again.
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Action Buttons */}
            {isFinalised ? (
              // Final state: Print, Share, Done
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print List
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button className="flex-1" onClick={handleDoneShopping}>
                  <Check className="h-4 w-4 mr-2" />
                  Done Shopping
                </Button>
              </div>
            ) : (
              // Editing state: Confirm/Save
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={allIngredients.length === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Shopping List
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function ShoppingListClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<
    Set<Id<"recipes">>
  >(new Set());
  const [showShoppingList, setShowShoppingList] = useState(false);

  const recipes = useQuery(api.recipes.getAllUserRecipes);

  // Filter recipes based on search and only show published recipes
  const filteredRecipes =
    recipes
      ?.filter((recipe) => recipe.status === "published")
      .filter((recipe) => {
        const matchesSearch =
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      }) || [];

  const selectedRecipes =
    recipes?.filter((r) => selectedRecipeIds.has(r._id)) || [];

  const handleToggleRecipe = (recipeId: Id<"recipes">) => {
    setSelectedRecipeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
    setShowShoppingList(false);
  };

  const handleGenerateList = () => {
    setShowShoppingList(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {showShoppingList ? (
          /* Shopping List View */
          <ShoppingList
            onBack={() => setShowShoppingList(false)}
            recipes={selectedRecipes}
          />
        ) : (
          /* Recipe Selection View */
          <>
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Create Shopping List
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Select recipes to generate your shopping list
                  </p>
                </div>
              </div>

              {/* Info Banner */}
              <Card className="bg-primary/5 border-primary/20 mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">
                        Smart Ingredient Combining
                      </p>
                      <p className="text-sm text-muted-foreground">
                        When you select multiple recipes, ingredients that
                        appear across different recipes will be automatically
                        combined and totaled. For example, if two recipes both
                        require onions, you&apos;ll see a single combined amount
                        on your shopping list.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Selected Recipes Summary */}
              <SelectedRecipesList recipes={selectedRecipes} />
            </div>

            {/* Recipe List */}
            {recipes === undefined ? (
              <LoadingState />
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 mx-auto">
                  <ChefHat className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {recipes.length === 0
                    ? "No recipes yet"
                    : "No recipes match your search"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {recipes.length === 0 ? (
                    <>
                      Start by creating some recipes, then come back here to
                      generate your shopping list.
                    </>
                  ) : (
                    <>Try adjusting your search terms to find recipes.</>
                  )}
                </p>
                {recipes.length === 0 && (
                  <Button asChild size="lg">
                    <Link href={ROUTES.MY_RECIPES}>Go to My Recipes</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecipes.map((recipe) => (
                  <RecipeSelectionCard
                    key={recipe._id}
                    recipe={recipe}
                    isSelected={selectedRecipeIds.has(recipe._id)}
                    onToggle={handleToggleRecipe}
                  />
                ))}
              </div>
            )}

            {/* Generate Button */}
            {selectedRecipeIds.size > 0 && (
              <div className="sticky bottom-20 mt-8 pb-4">
                <Button
                  size="lg"
                  className="w-full shadow-lg"
                  onClick={handleGenerateList}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Create Shopping List ({selectedRecipeIds.size}{" "}
                  {selectedRecipeIds.size === 1 ? "recipe" : "recipes"})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
