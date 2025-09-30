import { Id } from "convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { RecipeClient } from "./_components/recipe-client";

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipeId = (await params).id as Id<"recipes"> | undefined;

  if (!recipeId) {
    notFound();
  }

  return <RecipeClient recipeId={recipeId} />;
}
