import { parseRecipeFromSiteWithAI } from "@/app/(app)/actions/parse-recipe";
import { type ParsedRecipeForDB } from "@/lib/types/recipe-parser";
import { useState } from "react";

type LoadingStage = "idle" | "fetching" | "categorising" | "complete";

export function useUrlImport() {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipeForDB | null>(
    null,
  );

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleImport = async (url: string) => {
    if (!url || !isValidUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    setError(null);
    setParsedRecipe(null);

    try {
      // Stage 1: Fetch and parse recipe with AI
      setLoadingStage("fetching");
      const parsed = await parseRecipeFromSiteWithAI(url);

      if (!parsed) {
        throw new Error(
          "Failed to extract recipe. The page may not contain a recipe, or it may be behind a paywall.",
        );
      }

      // Stage 2: Finalize
      setLoadingStage("categorising");
      setParsedRecipe(parsed);
      setLoadingStage("complete");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoadingStage("idle");
    }
  };

  const reset = () => {
    setParsedRecipe(null);
    setLoadingStage("idle");
    setError(null);
  };

  return {
    loadingStage,
    error,
    parsedRecipe,
    handleImport,
    reset,
    setParsedRecipe,
    isValidUrl,
  };
}
