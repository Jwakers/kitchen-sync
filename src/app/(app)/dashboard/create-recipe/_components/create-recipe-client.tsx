"use client";

import { RecipeForm } from "@/app/(app)/_components.tsx/recipe-form";
import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CreateRecipeClient() {
  return (
    <div
      className="flex flex-col h-full w-full max-w-4xl mx-auto"
      style={{
        minHeight: `calc(100dvh - var(--nav-height) - var(--header-height))`,
      }}
    >
      <header className="shrink-0 border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="size-8">
            <Link href={ROUTES.MY_RECIPES} aria-label="Back to My Recipes">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-lg">Create Recipe</h1>
            <p className="text-muted-foreground text-sm">
              Fill in the details to create your recipe
            </p>
          </div>
        </div>
      </header>
      <RecipeForm />
    </div>
  );
}
