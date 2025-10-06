"use client";

import { CATEGORY_COLORS, ROUTES } from "@/app/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { titleCase } from "@/lib/utils";
import { api } from "convex/_generated/api";
import { RECIPE_CATEGORIES } from "convex/lib/constants";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Clock, Filter, Plus, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import { AddRecipeDrawer } from "../../../_components.tsx/add-recipe-drawer";

function RecipeCard({
  recipe,
}: {
  recipe: FunctionReturnType<typeof api.recipes.getAllUserRecipes>[number];
}) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
  const categoryLabel = titleCase(recipe.category);
  const categoryColor = CATEGORY_COLORS[recipe.category];

  return (
    <Link href={`${ROUTES.RECIPE}/${recipe._id}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 pt-0">
        {/* Recipe Image Placeholder */}
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {recipe.image && (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1440px) 25vw, 450px"
              className="object-cover size-full"
              unoptimized
            />
          )}
          <div className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className={`${categoryColor} border-0 font-medium`}
            >
              {categoryLabel}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        <CardContent>
          <div className="space-y-3">
            {/* Timing Information */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Serves {recipe.serves}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  recipe.status === "published" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {recipe.status === "published" ? "Published" : "Draft"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(
                  recipe.updatedAt ?? recipe._creationTime
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecipeCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden">
      {/* Recipe Image Skeleton */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Timing Information Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Status Badge Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <RecipeCardSkeleton key={index} />
      ))}
    </div>
  );
}

function EmptyState({
  setAddRecipeDrawerOpen,
}: {
  setAddRecipeDrawerOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Plus className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">
        No recipes yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start building your recipe collection by creating your first recipe.
        Share your culinary creations with the world!
      </p>
      <Button
        size="lg"
        className="gap-2"
        onClick={() => setAddRecipeDrawerOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Create Your First Recipe
      </Button>
    </div>
  );
}

export default function RecipeListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddRecipeDrawer, setShowAddRecipeDrawer] = useState(false);

  const recipes = useQuery(api.recipes.getAllUserRecipes);

  // Filter recipes based on search and category
  const filteredRecipes =
    recipes?.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || recipe.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }) || [];

  const publishedCount =
    recipes?.filter((r) => r.status === "published").length || 0;
  const draftCount = recipes?.filter((r) => r.status === "draft").length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                My Recipes
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage and organise your culinary creations
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowAddRecipeDrawer(true)}
              className="hidden md:flex"
            >
              <Plus className="h-5 w-5" />
              Add Recipe
            </Button>
          </div>

          {/* Stats */}
          {recipes && recipes.length > 0 && (
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-sm font-medium">
                  {publishedCount} Published
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                <span className="text-sm font-medium">{draftCount} Drafts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-chart-2 rounded-full" />
                <span className="text-sm font-medium">
                  {recipes.length} Total
                </span>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {RECIPE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {titleCase(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {recipes === undefined ? (
          <LoadingState />
        ) : filteredRecipes.length === 0 ? (
          recipes && recipes.length > 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No recipes match your search or selected category.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <EmptyState setAddRecipeDrawerOpen={setShowAddRecipeDrawer} />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Add Recipe Drawer */}
        <AddRecipeDrawer
          open={showAddRecipeDrawer}
          onOpenChange={setShowAddRecipeDrawer}
        />
      </div>
    </div>
  );
}
