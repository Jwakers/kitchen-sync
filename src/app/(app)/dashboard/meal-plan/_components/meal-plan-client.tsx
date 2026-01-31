"use client";

import { ROUTES } from "@/app/constants";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  Calendar,
  CalendarCheck,
  ChefHat,
  Home,
  MoreVertical,
  Plus,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type CurrentPlan = NonNullable<
  FunctionReturnType<typeof api.mealPlans.getCurrentMealPlan>
>;
type UserRecipe = FunctionReturnType<
  typeof api.recipes.getAllUserRecipes
>[number];
type HouseholdRecipe = FunctionReturnType<
  typeof api.households.getAllHouseholdRecipes
>[number];
type Recipe = UserRecipe | HouseholdRecipe;

const MEAL_LABELS = ["Breakfast", "Lunch", "Dinner", "Other"] as const;

function startOfDayMs(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDateKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function MealPlanClient() {
  const router = useRouter();
  const currentPlan = useQuery(api.mealPlans.getCurrentMealPlan);
  const userRecipes = useQuery(api.recipes.getAllUserRecipes);
  const householdRecipes = useQuery(api.households.getAllHouseholdRecipes);
  const households = useQuery(api.households.getUserHouseholds);
  const activeShoppingList = useQuery(api.shoppingLists.getActiveShoppingList);
  const personalChalkboard = useQuery(api.chalkboard.getPersonalChalkboard);
  const householdChalkboards = useQuery(
    api.chalkboard.getAllHouseholdChalkboards
  );

  const createMealPlan = useMutation(api.mealPlans.createMealPlan);
  const addEntry = useMutation(api.mealPlans.addEntry);
  const removeEntry = useMutation(api.mealPlans.removeEntry);
  const deleteMealPlan = useMutation(api.mealPlans.deleteMealPlan);
  const shareMealPlanWithHousehold = useMutation(
    api.mealPlans.shareMealPlanWithHousehold
  );
  const unshareMealPlan = useMutation(api.mealPlans.unshareMealPlan);
  const createShoppingListFromMealPlan = useMutation(
    api.shoppingLists.createShoppingListFromMealPlan
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createEndDate, setCreateEndDate] = useState("");
  const [addingForDate, setAddingForDate] = useState<number | null>(null);
  const [selectedChalkboardIds, setSelectedChalkboardIds] = useState<
    Set<Id<"chalkboardItems">>
  >(new Set());
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareHouseholdId, setShareHouseholdId] = useState<
    Id<"households"> | ""
  >("");
  const [showDeletePlanDialog, setShowDeletePlanDialog] = useState(false);

  const allRecipes = useMemo(() => {
    const user = userRecipes ?? [];
    const household = householdRecipes ?? [];
    return [...user, ...household];
  }, [userRecipes, householdRecipes]);

  const displayRange = useMemo((): { start: number; end: number } | null => {
    if (!currentPlan) return null;
    const today = startOfDayMs(Date.now());
    const entries = currentPlan.entries ?? [];
    const minEntryDate =
      entries.length > 0 ? Math.min(...entries.map((e) => e.date)) : today;
    const start =
      currentPlan.startDate ?? Math.min(minEntryDate, currentPlan.endDate);
    return { start, end: currentPlan.endDate };
  }, [currentPlan]);

  const daysWithEntries = useMemo(() => {
    if (!currentPlan || !displayRange) return [];
    const days: {
      date: number;
      dateLabel: string;
      entries: CurrentPlan["entries"];
    }[] = [];
    for (
      let d = displayRange.start;
      d <= displayRange.end;
      d += 24 * 60 * 60 * 1000
    ) {
      const dayStart = startOfDayMs(d);
      const entries =
        currentPlan.entries?.filter((e) => startOfDayMs(e.date) === dayStart) ??
        [];
      days.push({
        date: dayStart,
        dateLabel: formatDateLabel(dayStart),
        entries,
      });
    }
    return days;
  }, [currentPlan, displayRange]);

  const defaultEndDate = useMemo(() => {
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return formatDateKey(startOfDayMs(in7.getTime()));
  }, []);

  const handleCreatePlan = async () => {
    const endDateMs = createEndDate
      ? (() => {
          const [y, m, d] = createEndDate.split("-").map(Number);
          return startOfDayMs(new Date(y, m - 1, d).getTime());
        })()
      : startOfDayMs(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
      await createMealPlan({ endDate: endDateMs });
      setShowCreateForm(false);
      setCreateEndDate("");
      toast.success("Meal plan created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create plan");
    }
  };

  const handleAddMeal = useCallback(
    async (dateMs: number, recipeId: Id<"recipes">, mealLabel?: string) => {
      if (!currentPlan) return;
      try {
        await addEntry({
          mealPlanId: currentPlan._id,
          date: dateMs,
          recipeId,
          mealLabel: mealLabel || undefined,
        });
        setAddingForDate(null);
        toast.success("Meal added");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to add meal");
      }
    },
    [currentPlan, addEntry]
  );

  const handleRemoveEntry = useCallback(
    async (entryId: Id<"mealPlanEntries">) => {
      try {
        await removeEntry({ entryId });
        toast.success("Meal removed");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to remove meal");
      }
    },
    [removeEntry]
  );

  const handleGenerateList = useCallback(async () => {
    if (!currentPlan) return;
    if (activeShoppingList) {
      toast.error(
        "You already have an active or draft shopping list. Complete or remove it first."
      );
      setShowGenerateDialog(false);
      return;
    }
    try {
      await createShoppingListFromMealPlan({
        mealPlanId: currentPlan._id,
        chalkboardItemIds: Array.from(selectedChalkboardIds),
      });
      setShowGenerateDialog(false);
      setSelectedChalkboardIds(new Set());
      toast.success("Shopping list created from meal plan");
      router.push(ROUTES.SHOPPING_LIST);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to create shopping list"
      );
    }
  }, [
    currentPlan,
    activeShoppingList,
    selectedChalkboardIds,
    createShoppingListFromMealPlan,
    router,
  ]);

  const handleShare = useCallback(async () => {
    if (!currentPlan || !shareHouseholdId) return;
    try {
      await shareMealPlanWithHousehold({
        mealPlanId: currentPlan._id,
        householdId: shareHouseholdId,
      });
      setShowShareDialog(false);
      setShareHouseholdId("");
      toast.success("Meal plan shared with household");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to share");
    }
  }, [currentPlan, shareHouseholdId, shareMealPlanWithHousehold]);

  const handleUnshare = useCallback(async () => {
    if (!currentPlan) return;
    try {
      await unshareMealPlan({ mealPlanId: currentPlan._id });
      toast.success("Meal plan is no longer shared");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to unshare");
    }
  }, [currentPlan, unshareMealPlan]);

  const handleDeletePlan = useCallback(async () => {
    if (!currentPlan) return;
    try {
      await deleteMealPlan({ mealPlanId: currentPlan._id });
      setShowDeletePlanDialog(false);
      toast.success("Meal plan deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete plan");
    }
  }, [currentPlan, deleteMealPlan]);

  const chalkboardItemsForGenerate = useMemo(() => {
    const personal = personalChalkboard ?? [];
    const byHousehold = householdChalkboards ?? {};
    const list: { id: Id<"chalkboardItems">; text: string; source: string }[] =
      [];
    personal.forEach((item) => {
      list.push({ id: item._id, text: item.text, source: "Personal" });
    });
    Object.entries(byHousehold).forEach(([householdId, items]) => {
      const householdName =
        households?.find((h) => h._id === householdId)?.name ?? "Household";
      items.forEach((item: { _id: Id<"chalkboardItems">; text: string }) => {
        list.push({ id: item._id, text: item.text, source: householdName });
      });
    });
    return list;
  }, [personalChalkboard, householdChalkboards, households]);

  if (currentPlan === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="bg-background w-full min-w-0 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Meal planning
            </h1>
            <p className="text-muted-foreground text-lg">
              Plan your week with recipes, then generate a shopping list in one
              place.
            </p>
          </div>
          <Card className="border-primary/20 bg-primary/5 p-8 text-center">
            <CardContent className="p-0">
              <CalendarCheck className="mx-auto size-16 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">No meal plan yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create a meal plan with an end date (default one week), add
                meals from your recipes, then generate a shopping list.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  setCreateEndDate(defaultEndDate);
                  setShowCreateForm(true);
                }}
              >
                <Calendar className="size-5 mr-2" />
                Create this week&apos;s plan
              </Button>
            </CardContent>
          </Card>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create meal plan</DialogTitle>
                <DialogDescription>
                  Set the end date for your plan (default: one week from today).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="endDate">End date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={createEndDate || defaultEndDate}
                    onChange={(e) => setCreateEndDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan}>Create plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const mealCount = currentPlan.entries?.length ?? 0;
  const sharedHousehold = currentPlan.householdId
    ? households?.find((h) => h._id === currentPlan.householdId)
    : null;

  return (
    <div className="bg-background min-w-0 w-full overflow-x-hidden">
      <div className="w-full max-w-full min-w-0 px-4 py-6 sm:py-8 sm:container sm:mx-auto box-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6 min-w-0">
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2 truncate">
              Meal planning
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base truncate">
              {displayRange
                ? `${formatDateLabel(displayRange.start)} – ${formatDateLabel(displayRange.end)} · ${mealCount} meal${mealCount !== 1 ? "s" : ""}`
                : "Your current plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center min-w-0 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setShowGenerateDialog(true)}
              disabled={mealCount === 0}
            >
              <ShoppingCart className="size-4 mr-2 shrink-0" />
              <span className="hidden sm:inline">Generate shopping list</span>
              <span className="sm:hidden">Generate list</span>
            </Button>
            {currentPlan.isOwner && (
              <>
                {sharedHousehold ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={handleUnshare}
                  >
                    <Users className="size-4 mr-2 shrink-0" />
                    <span className="hidden sm:inline">Stop sharing</span>
                    <span className="sm:hidden">Unshare</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Users className="size-4 mr-2 shrink-0" />
                    <span className="hidden sm:inline">
                      Share with household
                    </span>
                    <span className="sm:hidden">Share</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="Plan options"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeletePlanDialog(true)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete meal plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        <AlertDialog
          open={showDeletePlanDialog}
          onOpenChange={setShowDeletePlanDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete meal plan?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this meal plan and all meals in it.
                You can create a new plan anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePlan}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {sharedHousehold && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="py-3 px-4 flex items-center gap-2">
              <Home className="size-4 text-primary" />
              <span className="text-sm">
                Shared with <strong>{sharedHousehold.name}</strong>
              </span>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 w-full min-w-0 max-w-full overflow-hidden">
          {daysWithEntries.map(({ date, dateLabel, entries }) => (
            <Card
              key={date}
              className="w-full min-w-0 max-w-full overflow-hidden"
            >
              <CardContent className="p-3 sm:p-4 w-full min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-3 min-w-0 overflow-hidden">
                  <h3 className="font-semibold truncate min-w-0">
                    {dateLabel}
                  </h3>
                  {currentPlan.isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setAddingForDate(date)}
                    >
                      <Plus className="size-4 mr-1 shrink-0" />
                      Add meal
                    </Button>
                  )}
                </div>
                <div className="space-y-2 min-w-0 overflow-hidden">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No meals planned
                    </p>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry._id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border bg-muted/30 w-full min-w-0 max-w-full overflow-hidden"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden basis-0">
                          {entry.recipe?.image ? (
                            <div className="relative size-9 sm:size-10 rounded overflow-hidden shrink-0">
                              <Image
                                src={entry.recipe.image}
                                alt={entry.recipe.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="size-9 sm:size-10 rounded bg-muted flex items-center justify-center shrink-0">
                              <ChefHat className="size-4 sm:size-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {entry.recipe?.title ?? "Unknown recipe"}
                            </p>
                            {entry.mealLabel && (
                              <p className="text-xs text-muted-foreground truncate">
                                {entry.mealLabel}
                              </p>
                            )}
                          </div>
                        </div>
                        {currentPlan.isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveEntry(entry._id)}
                            aria-label={`Remove ${entry.recipe?.title ?? "this meal"} from this day`}
                          >
                            <Trash2 className="size-4 sm:mr-1" />
                            <span className="hidden sm:inline text-xs">
                              Remove
                            </span>
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add meal dialog */}
        <Dialog
          open={addingForDate !== null}
          onOpenChange={(open) => !open && setAddingForDate(null)}
        >
          <DialogContent className="max-h-[85vh] flex flex-col w-[calc(100vw-2rem)] max-w-md">
            <DialogHeader>
              <DialogTitle>Add meal to this day</DialogTitle>
              <DialogDescription>
                {addingForDate != null ? (
                  <>
                    <span className="font-medium text-foreground">
                      {formatDateLabel(addingForDate)}
                    </span>
                    {" — "}
                    Pick a recipe below to add to this day.
                  </>
                ) : (
                  "Choose a recipe"
                )}
              </DialogDescription>
            </DialogHeader>
            {allRecipes.length === 0 ? (
              <Card className="border-primary/20 bg-primary/5 p-6 text-center">
                <CardContent className="p-0">
                  <ChefHat className="mx-auto size-12 text-primary mb-3" />
                  <p className="font-medium mb-1">No recipes yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add recipes first, then come back to add them to your meal
                    plan.
                  </p>
                  <Button asChild>
                    <Link href={ROUTES.MY_RECIPES}>
                      <Plus className="size-4 mr-2" />
                      Add your first recipe
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 py-2 min-h-0">
                {allRecipes.map((recipe) => (
                  <AddMealRecipeRow
                    key={recipe._id}
                    recipe={recipe}
                    onSelect={(recipeId, mealLabel) => {
                      if (addingForDate != null) {
                        handleAddMeal(addingForDate, recipeId, mealLabel);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Generate shopping list dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate shopping list</DialogTitle>
              <DialogDescription>
                Create a shopping list from your meal plan ingredients.
                Optionally include chalkboard items.
              </DialogDescription>
            </DialogHeader>
            {chalkboardItemsForGenerate.length > 0 && (
              <div className="space-y-2 py-2">
                <Label>Include chalkboard items</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                  {chalkboardItemsForGenerate.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedChalkboardIds.has(item.id)}
                        onChange={(e) => {
                          setSelectedChalkboardIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(item.id);
                            else next.delete(item.id);
                            return next;
                          });
                        }}
                      />
                      <span className="text-sm truncate">{item.text}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {item.source}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateList}
                disabled={!!activeShoppingList}
              >
                Create shopping list
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share with household dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share with household</DialogTitle>
              <DialogDescription>
                Household members can view this meal plan and generate their own
                shopping list from it.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label>Household</Label>
              <Select
                value={shareHouseholdId}
                onValueChange={(v) =>
                  setShareHouseholdId(v as Id<"households">)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select household" />
                </SelectTrigger>
                <SelectContent>
                  {(households ?? []).map((h) => (
                    <SelectItem key={h._id} value={h._id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={!shareHouseholdId}>
                Share
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function AddMealRecipeRow({
  recipe,
  onSelect,
}: {
  recipe: Recipe;
  onSelect: (recipeId: Id<"recipes">, mealLabel?: string) => void;
}) {
  const [mealLabel, setMealLabel] = useState<string>("");
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50">
      <div className="relative size-12 rounded overflow-hidden shrink-0">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="size-12 bg-muted flex items-center justify-center">
            <ChefHat className="size-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{recipe.title}</p>
      </div>
      <Select value={mealLabel} onValueChange={setMealLabel}>
        <SelectTrigger className="w-28 shrink-0">
          <SelectValue placeholder="Meal" />
        </SelectTrigger>
        <SelectContent>
          {MEAL_LABELS.map((label) => (
            <SelectItem key={label} value={label}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={() => onSelect(recipe._id, mealLabel || undefined)}
      >
        Add
      </Button>
    </div>
  );
}
