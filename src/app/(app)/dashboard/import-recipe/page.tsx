"use client";

import { getRecipeSchema } from "@/app/(app)/actions/get-recipe-schema";
import {
  ParsedRecipeForDB,
  parseRecipeWithAI,
} from "@/app/(app)/actions/parse-recipe-with-ai";
import { ROUTES } from "@/app/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  Globe,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LoadingStage =
  | "idle"
  | "fetching"
  | "analysing"
  | "categorising"
  | "complete";

export default function ImportRecipePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipeForDB | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !isValidUrl(url)) return;

    setError(null);
    setParsedRecipe(null);

    try {
      // Stage 1: Fetch recipe data
      setLoadingStage("fetching");
      const {
        recipe,
        error: fetchError,
        url: recipeUrl,
      } = await getRecipeSchema(url);

      if (fetchError || !recipe) {
        throw new Error(fetchError || "Failed to fetch recipe");
      }

      // Stage 2: Analysing ingredients
      setLoadingStage("analysing");

      // Small delay to show the analysing stage
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Stage 3: Categorising and generating method
      setLoadingStage("categorising");
      const parsed = await parseRecipeWithAI(recipe, recipeUrl || undefined);

      if (!parsed) {
        throw new Error("Failed to parse recipe");
      }

      setParsedRecipe(parsed);
      setLoadingStage("complete");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoadingStage("idle");
    }
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const clearAll = () => {
    setUrl("");
    setParsedRecipe(null);
    setLoadingStage("idle");
    setError(null);
    setIsSaved(false);
  };

  // Warn user before leaving if recipe is not saved
  useEffect(() => {
    const hasUnsavedRecipe = parsedRecipe && !isSaved;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRecipe) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    if (hasUnsavedRecipe) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [parsedRecipe, isSaved]);

  const isLoading = loadingStage !== "idle" && loadingStage !== "complete";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={(e) => {
              if (parsedRecipe && !isSaved) {
                const confirmed = window.confirm(
                  "You have an unsaved recipe. Are you sure you want to leave?"
                );
                if (!confirmed) {
                  e.preventDefault();
                  return;
                }
              }
              router.push(ROUTES.MY_RECIPES);
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Import Recipe from URL
            </h1>
            <p className="text-muted-foreground mt-1">
              Import recipes from any cooking website with AI
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Enter Recipe URL</h2>
              <p className="text-sm text-muted-foreground">
                Paste the URL of the recipe you want to import
              </p>
            </div>
          </div>

          <form onSubmit={handleImport} className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="recipe-url"
                className="text-sm font-medium text-foreground"
              >
                Recipe URL
              </label>
              <Input
                id="recipe-url"
                type="url"
                placeholder="https://www.allrecipes.com/recipe/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Supported sites include AllRecipes, BBC Good Food, Food Network,
                and many more
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={!url || !isValidUrl(url) || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Import Recipe
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearAll}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
        </Card>

        {/* Loading Progress */}
        {isLoading && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <LoadingStep
                stage="fetching"
                currentStage={loadingStage}
                title="Fetching recipe data"
                description="Reading recipe from website..."
              />
              <LoadingStep
                stage="analysing"
                currentStage={loadingStage}
                title="Analysing ingredients with AI"
                description="Parsing amounts, units, and preparation methods..."
              />
              <LoadingStep
                stage="categorising"
                currentStage={loadingStage}
                title="Organizing recipe"
                description="Determining category and creating method steps..."
              />
            </div>
          </Card>
        )}

        {/* Recipe Preview */}
        {parsedRecipe && loadingStage === "complete" && (
          <RecipePreview recipe={parsedRecipe} isSaved={isSaved} />
        )}
      </div>
    </div>
  );
}

// Loading Step Component
function LoadingStep({
  stage,
  currentStage,
  title,
  description,
}: {
  stage: LoadingStage;
  currentStage: LoadingStage;
  title: string;
  description: string;
}) {
  const stages: LoadingStage[] = [
    "idle",
    "fetching",
    "analysing",
    "categorising",
    "complete",
  ];
  const currentIndex = stages.indexOf(currentStage);
  const stageIndex = stages.indexOf(stage);

  const isActive = currentIndex === stageIndex;
  const isComplete = currentIndex > stageIndex;

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : isActive ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-muted" />
        )}
      </div>
      <div>
        <p
          className={`font-medium ${isActive || isComplete ? "text-foreground" : "text-muted-foreground"}`}
        >
          {title}
        </p>
        {isActive && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// Recipe Preview Component
function RecipePreview({
  recipe,
  isSaved,
}: {
  recipe: ParsedRecipeForDB;
  isSaved: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="font-medium text-green-900 dark:text-green-100">
              Recipe imported successfully!
            </p>
          </div>
          {!isSaved && (
            <Badge
              variant="outline"
              className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900 text-yellow-900 dark:text-yellow-100"
            >
              Not saved
            </Badge>
          )}
        </div>
      </Card>

      {/* Recipe Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {recipe.title}
            </h2>
            {recipe.description && (
              <p className="text-muted-foreground">{recipe.description}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4">
            {recipe.prepTime > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Prep:</span>
                <span className="font-medium">{recipe.prepTime} min</span>
              </div>
            )}
            {recipe.cookTime > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cook:</span>
                <span className="font-medium">{recipe.cookTime} min</span>
              </div>
            )}
            {recipe.serves > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Serves:</span>
                <span className="font-medium">{recipe.serves}</span>
              </div>
            )}
            <Badge variant="secondary" className="capitalize">
              {recipe.category}
            </Badge>
          </div>

          {/* Attribution */}
          {(recipe.originalAuthor || recipe.originalUrl || recipe.rating) && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Source Information
              </p>
              {recipe.originalAuthor && (
                <p className="text-sm text-muted-foreground">
                  By{" "}
                  <span className="font-medium">{recipe.originalAuthor}</span>
                </p>
              )}
              {recipe.originalUrl && (
                <p className="text-sm">
                  <a
                    href={recipe.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View original recipe →
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Nutrition (if available) */}
      {recipe.nutrition && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Nutrition Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.nutrition.calories && (
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="font-medium">{recipe.nutrition.calories}</p>
              </div>
            )}
            {recipe.nutrition.protein && (
              <div>
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="font-medium">{recipe.nutrition.protein}</p>
              </div>
            )}
            {recipe.nutrition.fat && (
              <div>
                <p className="text-sm text-muted-foreground">Fat</p>
                <p className="font-medium">{recipe.nutrition.fat}</p>
              </div>
            )}
            {recipe.nutrition.carbohydrates && (
              <div>
                <p className="text-sm text-muted-foreground">Carbs</p>
                <p className="font-medium">{recipe.nutrition.carbohydrates}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Ingredients */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1">•</span>
              <span>
                <span className="font-medium">{ingredient.amount}</span>
                {ingredient.unit && ` ${ingredient.unit}`}
                {ingredient.name && ` ${ingredient.name}`}
                {ingredient.preparation && (
                  <span className="text-muted-foreground italic">
                    , {ingredient.preparation}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Method */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Method</h3>
        <ol className="space-y-4">
          {recipe.method.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">{step.title}</p>
                {step.description && (
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Save Buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          size="lg"
          disabled={isSaved}
          onClick={() => {
            // TODO: Implement actual save functionality
            console.log("Saving recipe:", recipe);
            alert("Recipe save functionality coming soon!");
          }}
        >
          {isSaved ? "Saved to Collection" : "Save Recipe"}
        </Button>
        <Button variant="outline" size="lg">
          Edit Recipe
        </Button>
      </div>
    </div>
  );
}
