"use client";

import { fetchImageServerSide } from "@/app/(app)/actions/fetch-image";
import { getRecipeSchema } from "@/app/(app)/actions/get-recipe-schema";
import { parseRecipeSchemaWithAI } from "@/app/(app)/actions/parse-recipe-schema-with-ai";
import { parseTextToRecipe } from "@/app/(app)/actions/parse-text-to-recipe";
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
import { type ParsedRecipeForDB } from "@/lib/types/recipe-parser";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  FileText,
  Globe,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { EditImportedRecipe } from "./edit-imported-recipe";
import { TextToRecipeParser } from "./text-to-recipe-parser";

type LoadingStage = "idle" | "fetching" | "categorising" | "complete";
type ImportSource = "url" | "text";

export function ImportRecipeClient() {
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
  const [showTextParser, setShowTextParser] = useState(false);
  const [importSource, setImportSource] = useState<ImportSource>("url");

  const createRecipeMutation = useMutation(api.recipes.createRecipe);
  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const updateRecipeImage = useMutation(
    api.recipes.updateRecipeImageAndDeleteOld
  );

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !isValidUrl(url)) return;

    setImportSource("url");
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
      const parsed = await parseRecipeSchemaWithAI(
        recipe,
        recipeUrl || undefined
      );

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
    setShowTextParser(false);
  };

  const handleTextRecipeParsed = async (text: string) => {
    setImportSource("text");
    setLoadingStage("fetching");
    setError(null);

    // Simulate stage progression for better UX
    const timeout = setTimeout(() => {
      setLoadingStage("categorising");
    }, 2000);

    const result = await parseTextToRecipe(text);

    clearTimeout(timeout);

    if (!result.success) {
      // If we have partial data, use it and enter edit mode
      if (result.partialRecipe) {
        const partialConverted: ParsedRecipeForDB = {
          title: result.partialRecipe.title ?? "Untitled Recipe",
          description: result.partialRecipe.description ?? "",
          prepTime: result.partialRecipe.prepTime ?? 0,
          cookTime: result.partialRecipe.cookTime ?? 0,
          serves: result.partialRecipe.serves ?? 4,
          category: result.partialRecipe.category ?? "main",
          ingredients: result.partialRecipe.ingredients ?? [],
          method: result.partialRecipe.method ?? [],
          nutrition: result.partialRecipe.nutrition,
          imageUrl: undefined,
          originalUrl: undefined,
          originalAuthor: undefined,
          importedAt: Date.now(),
          originalPublishedDate: undefined,
          rating: undefined,
        };

        setParsedRecipe(partialConverted);
        setLoadingStage("complete");
        setShowTextParser(false);
        setIsEditMode(true);

        toast.error("Recipe incomplete", {
          description:
            result.error || "Please complete the missing fields in edit mode",
        });
      } else {
        setLoadingStage("idle");
        setError(result.error || "Failed to create recipe from text");
        throw new Error(result.error ?? "Text parsing failed");
      }
      return;
    }

    if (!result.recipe) {
      setLoadingStage("idle");
      setError("Failed to create recipe from text");
      throw new Error("Failed to create recipe from text");
    }

    // Convert ParsedRecipeFromText to ParsedRecipeForDB format
    const convertedRecipe: ParsedRecipeForDB = {
      title: result.recipe.title,
      description: result.recipe.description,
      prepTime: result.recipe.prepTime,
      cookTime: result.recipe.cookTime,
      serves: result.recipe.serves,
      category: result.recipe.category,
      ingredients: result.recipe.ingredients,
      method: result.recipe.method,
      nutrition: result.recipe.nutrition,
      imageUrl: undefined, // No image from text parsing
      originalUrl: undefined,
      originalAuthor: undefined,
      importedAt: Date.now(),
      originalPublishedDate: undefined,
      rating: undefined,
    };
    setParsedRecipe(convertedRecipe);
    setLoadingStage("complete");
    setShowTextParser(false);
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

      // Nutrition values are already parsed as integers (grams) from the AI parser
      const nutrition = validatedRecipe.nutrition;

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

      if (validatedRecipe.imageUrl) {
        const promise = handleImageUpload(recipeId, validatedRecipe.imageUrl);
        toast.promise(promise, {
          loading: "Uploading image...",
          success: "Image uploaded successfully",
          error: "Failed to upload image",
        });
      }

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

  const handleImageUpload = async (
    recipeId: Id<"recipes">,
    imageUrl: string
  ) => {
    // Fetch image server-side to bypass CORS
    const result = await fetchImageServerSide(imageUrl);

    if (!result.success || !result.data || !result.contentType) {
      throw new Error(result.error || "Failed to fetch image");
    }

    // Convert data URL to blob
    const response = await fetch(result.data);
    const blob = await response.blob();

    // Upload to Convex
    const postUrl = await generateUploadUrl();

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 30_000);
    const uploadResult = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": result.contentType },
      body: blob,
      signal: ac.signal,
    }).finally(() => clearTimeout(t));

    const { storageId } = await uploadResult.json();

    await updateRecipeImage({
      recipeId,
      storageId,
    });
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
    <div className="bg-background">
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

        {/* Main Card - URL Import */}
        {!isLoading && !parsedRecipe && !showTextParser && (
          <>
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
                    Supported sites include AllRecipes, BBC Good Food, Food
                    Network, and many more
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

              {/* Error Message with Text Parser CTA */}
              {error && (
                <div className="mt-6 space-y-3">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Can&apos;t import from URL?</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        Try pasting the recipe text directly instead. AI will
                        organize it for you automatically.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTextParser(true)}
                        className="mt-2"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Paste Recipe Text
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </Card>

            {/* Subtle CTA for Text Parser (when no error) */}
            {!error && (
              <Card className="p-4 mb-6 bg-muted/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Have recipe text instead?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Paste any recipe text and AI will organize it
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTextParser(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Paste Text
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Text Parser Component */}
        {showTextParser && !isLoading && !parsedRecipe && (
          <div className="space-y-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTextParser(false)}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to URL Import
            </Button>
            <TextToRecipeParser
              onRecipeParsed={handleTextRecipeParsed}
              showAsError={!!error}
            />
          </div>
        )}

        {/* Loading Progress */}
        {isLoading && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <LoadingStep
                stage="fetching"
                currentStage={loadingStage}
                title={
                  importSource === "url"
                    ? "Fetching recipe data"
                    : "Validating recipe text"
                }
                description={
                  importSource === "url"
                    ? "Reading recipe from website..."
                    : "Checking recipe format..."
                }
              />
              <LoadingStep
                stage="categorising"
                currentStage={loadingStage}
                title="Processing recipe with AI"
                description={
                  importSource === "url"
                    ? "Parsing ingredients, categorizing, and creating method steps..."
                    : "Organizing ingredients, generating descriptions, and calculating nutrition..."
                }
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
          Review the imported recipe below and make any changes before saving.
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
              <div className="flex items-center gap-2 text-sm">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cook:</span>
                <span className="font-medium">
                  {recipe.cookTime === undefined || recipe.cookTime === 0
                    ? "No cooking required"
                    : `${recipe.cookTime} min`}
                </span>
              </div>
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

            {recipe.imageUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="object-cover"
                  fill
                  unoptimized
                />
              </div>
            )}
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
                  <p className="font-medium">{recipe.nutrition.protein}g</p>
                </div>
              )}
              {recipe.nutrition.fat && (
                <div>
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="font-medium">{recipe.nutrition.fat}g</p>
                </div>
              )}
              {recipe.nutrition.carbohydrates && (
                <div>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="font-medium">
                    {recipe.nutrition.carbohydrates}g
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
