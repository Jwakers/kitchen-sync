"use client";

import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, Edit, Globe, Palette, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RecipeForm } from "./recipe-form";

type AddRecipeDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddRecipeDrawer({ open, onOpenChange }: AddRecipeDrawerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] =
    useState<Id<"recipes"> | null>(null);

  const draftRecipes = useQuery(api.recipes.getDraftRecipes, {
    cursor: undefined,
  });

  const handleCreateOwn = () => {
    setSelectedRecipeId(null);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
  };

  useEffect(() => {
    if (open) return;

    setShowForm(false);
  }, [open]);

  useEffect(() => {
    if (selectedRecipeId) {
      setShowForm(true);
    }
  }, [selectedRecipeId]);

  if (showForm) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DrawerTitle>Create Recipe</DrawerTitle>
            </div>
            <DrawerDescription>
              Fill in the details to create your recipe
            </DrawerDescription>
          </DrawerHeader>
          <RecipeForm
            selectedRecipeId={selectedRecipeId}
            closeDrawer={() => onOpenChange(false)}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Recipe</DrawerTitle>
          <DrawerDescription>
            Choose how you&apos;d like to add a new recipe
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 p-4">
          {draftRecipes?.length ? (
            <Card className="p-6 text-left">
              <div className="flex items-center gap-4">
                <div className="p-3 border border-primary rounded-lg">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Resume Draft Recipe</h3>
                  <p className="text-muted-foreground text-sm">
                    Resume building your draft recipe
                  </p>
                  <ul className="mt-4 space-y-1">
                    {draftRecipes.map((recipe) => (
                      <li key={recipe._id}>
                        <button
                          type="button"
                          className="p-4 rounded border border-dashed flex justify-between w-full gap-2"
                          onClick={() => setSelectedRecipeId(recipe._id)}
                        >
                          <span className="text-sm font-bold">
                            {recipe.title}
                          </span>
                          <Pencil />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : null}

          <button
            onClick={handleCreateOwn}
            type="button"
            className="cursor-pointer"
            aria-label="Create Your Own"
          >
            <Card className="p-6 text-left">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-lg">
                  <Palette className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Create Your Own</h3>
                  <p className="text-muted-foreground text-sm">
                    Start from scratch and build your perfect recipe
                  </p>
                </div>
              </div>
            </Card>
          </button>

          <Link href={ROUTES.DASHBOARD}>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <Globe className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Get Recipe from URL</h3>
                  <p className="text-muted-foreground text-sm">
                    Import a recipe from any website (coming soon)
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
