"use client";

import { CATEGORY_COLORS, ROUTES, STORAGE_KEYS } from "@/app/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { titleCase } from "@/lib/utils";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  ListChecks,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ShoppingList from "./shopping-list";
import { ShoppingListItem } from "./types";

type Recipe = FunctionReturnType<typeof api.recipes.getAllUserRecipes>[number];

type LocalStorageShoppingList = {
  dateStored: number;
  allIngredients: ShoppingListItem[];
  checkedItems: string[];
};

export default function ShoppingListClient() {
  const recipes = useQuery(api.recipes.getAllUserRecipes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<
    Set<Id<"recipes">>
  >(new Set());
  const [showShoppingList, setShowShoppingList] = useState(false);
  const selectedRecipes = useMemo(
    () => recipes?.filter((r) => selectedRecipeIds.has(r._id)) || [],
    [recipes, selectedRecipeIds]
  );
  const flatIngredients = useMemo(
    () => buildShoppingListItems(selectedRecipes ?? []),
    [selectedRecipes]
  );
  const [allIngredients, setAllIngredients] =
    useState<ShoppingListItem[]>(flatIngredients);
  const [isFinalised, setIsFinalised] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showDoneDialog, setShowDoneDialog] = useState(false);
  const [showLocalStorageDialog, setShowLocalStorageDialog] = useState(false);
  const [localStorageData, setLocalStorageData] =
    useState<LocalStorageShoppingList | null>(null);

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

  const handleLoadLocalStorage = () => {
    if (!localStorageData) return;
    setAllIngredients(localStorageData?.allIngredients ?? []);
    setCheckedItems(new Set(localStorageData?.checkedItems ?? []));
    setIsFinalised(true);
    setShowShoppingList(true);
  };

  const getStoredShoppingList = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.shoppingList);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return null;
      const { dateStored, allIngredients, checkedItems } =
        parsed as Partial<LocalStorageShoppingList> & Record<string, unknown>;
      if (typeof dateStored !== "number" || !Array.isArray(allIngredients)) {
        console.error("Invalid shopping list stored", parsed);
        return null;
      }
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dateStored > oneWeek) {
        window.localStorage.removeItem(STORAGE_KEYS.shoppingList);
        return null;
      }
      return {
        dateStored,
        allIngredients,
        // tolerate older records without this field
        checkedItems: Array.isArray(checkedItems) ? checkedItems : [],
      } as LocalStorageShoppingList;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const removeStoredShoppingList = () => {
    window.localStorage.removeItem(STORAGE_KEYS.shoppingList);
  };

  const handleConfirm = () => {
    if (isFinalised) {
      setShowDoneDialog(true);
      return;
    }
    setIsFinalised(true);
  };

  const handleDoneShopping = () => {
    setShowDoneDialog(false);
    setShowShoppingList(false);
    setSelectedRecipeIds(new Set());
    setAllIngredients([]);
    setCheckedItems(new Set());
    setIsFinalised(false);
    removeStoredShoppingList();
    toast.success("Shopping complete! Happy cooking!");
  };

  useEffect(() => {
    const list = getStoredShoppingList();
    if (!list) return;

    setLocalStorageData(list);
  }, []);

  useEffect(() => {
    if (!localStorageData) return;
    setShowLocalStorageDialog(true);
  }, [localStorageData]);

  useEffect(() => {
    if (selectedRecipes.length === 0) return;
    setAllIngredients(buildShoppingListItems(selectedRecipes));
  }, [selectedRecipes]);

  useEffect(() => {
    if (!isFinalised) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.shoppingList,
        JSON.stringify({
          dateStored: Date.now(),
          allIngredients,
          checkedItems: Array.from(checkedItems),
        })
      );
    } catch (error) {
      console.error(error);
    }
  }, [allIngredients, checkedItems, isFinalised]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {showShoppingList ? (
            /* Shopping List View */
            <ShoppingList
              allIngredients={allIngredients}
              setAllIngredients={setAllIngredients}
              onConfirm={handleConfirm}
              onDone={() => setShowDoneDialog(true)}
              onBack={() => setShowShoppingList(false)}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              isFinalised={isFinalised}
              setIsFinalised={setIsFinalised}
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
                          require onions, you&apos;ll see a single combined
                          amount on your shopping list.
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
                <div className="sticky bottom-nav mt-8">
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
      <ConfirmLocalStorageDialog
        open={showLocalStorageDialog}
        onOpenChange={setShowLocalStorageDialog}
        onConfirm={handleLoadLocalStorage}
        data={localStorageData}
        onCancel={() => {
          removeStoredShoppingList();
          setLocalStorageData(null);
          setShowLocalStorageDialog(false);
        }}
      />
      <AlertDialog open={showDoneDialog} onOpenChange={setShowDoneDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Shopping?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your shopping list and return you to the recipe
              selection. Are you sure you&apos;re done shopping?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDoneShopping}>
              Yes, I&apos;m Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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

function ConfirmLocalStorageDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  data: LocalStorageShoppingList | null;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Found a shopping list from a previous session?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Shopping lists are saved for one week in device storage. Do you want
            to load the list from the previous session on{" "}
            {new Date(data?.dateStored ?? 0).toLocaleDateString()}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            No, start a new list
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Yes, load list
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const normaliseKey = (ingredient: NonNullable<Recipe["ingredients"]>[number]) =>
  [
    ingredient?.name?.trim().toLowerCase() ?? "",
    ingredient?.unit?.trim().toLowerCase() ?? "",
    ingredient?.preparation?.trim().toLowerCase() ?? "",
  ].join("|");

const buildShoppingListItems = (recipes: Recipe[]) => {
  const combined = new Map<string, ShoppingListItem>();

  recipes.forEach((recipe) => {
    recipe.ingredients?.forEach((ingredient) => {
      if (!ingredient?.name) return;

      const key = normaliseKey(ingredient);
      const existing = combined.get(key);
      const amountValue =
        typeof ingredient.amount === "number"
          ? ingredient.amount
          : Number(ingredient.amount);

      if (!existing) {
        combined.set(key, {
          id: crypto.randomUUID(),
          name: ingredient.name,
          unit: ingredient.unit,
          preparation: ingredient.preparation,
          amount: Number.isFinite(amountValue)
            ? amountValue
            : ingredient.amount,
        });
        return;
      }

      if (typeof existing.amount === "number" && Number.isFinite(amountValue)) {
        existing.amount += amountValue;
      } else if (ingredient.amount) {
        const parts = [existing.amount, ingredient.amount]
          .filter(Boolean)
          .map(String);
        existing.amount = parts.join(" + ");
      }
    });
  });

  return Array.from(combined.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};
