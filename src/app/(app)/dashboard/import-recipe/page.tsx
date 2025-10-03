"use client";

import { getRecipeSchema } from "@/app/(app)/actions/get-recipe-schema";
import {
  ParsedRecipeForDB,
  parseRecipeWithAI,
} from "@/app/(app)/actions/parse-recipe-with-ai";
import { ROUTES } from "@/app/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  importedRecipeSchema,
  type ImportedRecipeFormData,
} from "@/lib/schemas/imported-recipe";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { EditImportedRecipe } from "./_components/edit-imported-recipe";

type LoadingStage = "idle" | "fetching" | "categorising" | "complete";

export default function ImportRecipePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipeForDB | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<Id<"recipes"> | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const createRecipeMutation = useMutation(api.recipes.createRecipe);

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

      // Stage 2: Parse with AI
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
    setIsEditMode(false);
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

  const validateAndSaveRecipe = async (
    recipeData: ParsedRecipeForDB | ImportedRecipeFormData
  ) => {
    try {
      setIsSaving(true);

      // Validate the recipe before saving
      const validationResult = importedRecipeSchema.safeParse(recipeData);

      if (!validationResult.success) {
        // Validation failed, enter edit mode

        const errors = z.flattenError(validationResult.error).fieldErrors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
          .join("; ");

        toast.error("Recipe validation failed", {
          description: "Please correct the errors in edit mode",
        });

        console.error("Validation errors:", errorMessages);
        setIsEditMode(true);
        setIsSaving(false);
        return;
      }

      // Validation passed, proceed with saving
      const validatedRecipe = validationResult.data;

      // TODO: Data parser should be aware these should be returns as integers that represent gram values. So some conversion may be needed.
      const nutrition = validatedRecipe.nutrition
        ? {
            calories: validatedRecipe.nutrition.calories
              ? parseInt(validatedRecipe.nutrition.calories)
              : undefined,
            protein: validatedRecipe.nutrition.protein
              ? parseInt(validatedRecipe.nutrition.protein)
              : undefined,
            fat: validatedRecipe.nutrition.fat
              ? parseInt(validatedRecipe.nutrition.fat)
              : undefined,
            carbohydrates: validatedRecipe.nutrition.carbohydrates
              ? parseInt(validatedRecipe.nutrition.carbohydrates)
              : undefined,
          }
        : undefined;

      const { recipeId, published } = await createRecipeMutation({
        title: validatedRecipe.title,
        description: validatedRecipe.description,
        prepTime: validatedRecipe.prepTime,
        cookTime: validatedRecipe.cookTime,
        serves: validatedRecipe.serves,
        category: validatedRecipe.category,
        ingredients: validatedRecipe.ingredients,
        method: validatedRecipe.method,
        nutrition,
        originalUrl: parsedRecipe?.originalUrl,
        originalAuthor: parsedRecipe?.originalAuthor,
        originalPublishedDate: parsedRecipe?.originalPublishedDate,
      });

      if (!published) {
        toast.info("There were some issues with the recipe", {
          description:
            "It has been saved as a draft. You can edit it and publish it later.",
        });
        return;
      }

      setSavedRecipeId(recipeId);
      setIsSaved(true);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!parsedRecipe) return;
    await validateAndSaveRecipe(parsedRecipe);
  };

  const handleEditSave = async (editedRecipe: ImportedRecipeFormData) => {
    await validateAndSaveRecipe(editedRecipe);
  };

  const isLoading = loadingStage !== "idle" && loadingStage !== "complete";

  // Edit Mode
  if (isEditMode && parsedRecipe && !isSaved) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <EditImportedRecipe
            recipe={parsedRecipe}
            onCancel={() => setIsEditMode(false)}
            onSave={handleEditSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    );
  }

  // Success State - Replace entire page content
  if (isSaved && savedRecipeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Recipe Saved Successfully!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your recipe has been added to your collection and is ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href={`${ROUTES.RECIPE}/${savedRecipeId}`}>
                View Recipe
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={ROUTES.MY_RECIPES}>Go to My Recipes</Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setUrl("");
                setParsedRecipe(null);
                setIsSaved(false);
                setSavedRecipeId(null);
                setLoadingStage("idle");
              }}
            >
              Import Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
                stage="categorising"
                currentStage={loadingStage}
                title="Processing recipe with AI"
                description="Parsing ingredients, categorizing, and creating method steps..."
              />
            </div>
          </Card>
        )}

        {/* Recipe Preview */}
        {parsedRecipe && loadingStage === "complete" && (
          <RecipePreview recipe={parsedRecipe} isSaved={isSaved} />
        )}

        {/* Save Buttons */}
        {parsedRecipe && loadingStage === "complete" && !isSaved && (
          <div className="flex gap-3 mt-4">
            <Button
              className="flex-1"
              size="lg"
              disabled={isLoading || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Recipe"
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={isLoading || isSaving}
              onClick={() => setIsEditMode(true)}
            >
              Edit Recipe
            </Button>
          </div>
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
      <Alert variant="default">
        <CheckCircle2 />
        <AlertTitle>
          <div className="flex items-center justify-between gap-2">
            <p>Recipe imported successfully!</p>
            {!isSaved && <Badge variant="outline">Not saved</Badge>}
          </div>
        </AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>

      {/* Recipe Header */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">{recipe.title}</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
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
          </div>
        </CardContent>
        {(recipe.originalAuthor || recipe.originalUrl || recipe.rating) && (
          <>
            <Separator />
            <CardFooter>
              <div className="space-y-2">
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
            </CardFooter>
          </>
        )}
      </Card>

      {/* Nutrition (if available) */}
      {recipe.nutrition && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Nutrition Information</h3>
          </CardHeader>
          <CardContent>
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
                  <p className="font-medium">
                    {recipe.nutrition.carbohydrates}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground mb-4 italic">
              Note: These are estimated values and may not be accurate.
            </p>
          </CardFooter>
        </Card>
      )}

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Ingredients</h3>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Method */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Method</h3>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
