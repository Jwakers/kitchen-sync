import { NutritionInfo } from "@/lib/types/recipe-parser";
import { RECIPE_CATEGORIES } from "convex/lib/constants";

/**
 * Converts ISO 8601 duration to minutes
 * Examples: "PT30M" -> 30, "PT1H30M" -> 90, "PT2H" -> 120
 */
export function parseDuration(duration?: string): number {
  if (!duration) return 0;

  const normalized = duration.toUpperCase();
  const matches = normalized.match(
    /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/
  );

  if (!matches) return 0;

  const days = matches[1] ? parseInt(matches[1], 10) : 0;
  const hours = matches[2] ? parseInt(matches[2], 10) : 0;
  const minutes = matches[3] ? parseInt(matches[3], 10) : 0;
  const seconds = matches[4] ? parseInt(matches[4], 10) : 0;

  return days * 24 * 60 + hours * 60 + minutes + Math.ceil(seconds / 60);
}

/**
 * Extracts serving count from recipeYield string
 * Examples: "12" -> 12, "Serves 4" -> 4, "4-6 servings" -> 4
 */
export function parseServings(recipeYield?: string): number {
  if (!recipeYield) return 4; // Default

  const match = recipeYield.match(/(\d+)/);
  return match ? parseInt(match[1]) : 4;
}

/**
 * Parses nutrition values to integers representing grams
 * Handles ranges, unit conversions, and unclear values with best judgment
 * Examples:
 * - "20g" -> 20
 * - "1500mg" -> 2 (rounded up from 1.5g)
 * - "10-15g" -> 15 (higher value)
 * - "100-500mg" -> 2 (middle value for high range, rounded up)
 * - "300 calories" -> 300
 * - "0.5g" -> 1 (rounded up)
 */
export function parseNutritionValue(value?: string): number | undefined {
  if (!value) return undefined;

  // Remove whitespace and convert to lowercase for easier parsing
  const normalized = value.toLowerCase().trim();

  // Extract numeric values and units
  // Pattern matches: number (with optional decimal) followed by optional unit
  // Also handles ranges like "10-15g" or "100-200 mg"
  const rangeMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(mg|g|gram|grams|milligram|milligrams)?/
  );

  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    const unit = rangeMatch[3];

    // Determine if it's a high range (difference > 100 for mg, > 10 for g)
    const isHighRange = unit?.startsWith("m")
      ? high - low > 100
      : high - low > 10;

    // Take higher value, or middle value for high ranges
    let valueInUnit = isHighRange ? (low + high) / 2 : high;

    // Convert to grams if needed
    if (unit?.startsWith("m")) {
      // milligrams to grams
      valueInUnit = valueInUnit / 1000;
    }

    // Round up to nearest integer
    return Math.ceil(valueInUnit);
  }

  // Single value match
  const singleMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(mg|g|gram|grams|milligram|milligrams|calorie|calories|cal|kcal)?/
  );

  if (singleMatch) {
    let numericValue = parseFloat(singleMatch[1]);
    const unit = singleMatch[2];

    // Convert to grams based on unit
    if (unit?.startsWith("m")) {
      // milligrams to grams
      numericValue = numericValue / 1000;
    }
    // For calories and kcal, keep as-is (already in the right unit)
    // For grams or no unit specified, keep as-is

    // Round up to nearest integer (since we store as integers representing grams)
    return Math.ceil(numericValue);
  }

  // If we can't parse it, return undefined
  return undefined;
}

/**
 * Parses nutrition object from string values to integer values (grams)
 */
export function parseNutritionData(nutrition?: {
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrates?: string;
}): NutritionInfo | undefined {
  if (!nutrition) return undefined;

  const parsed = {
    calories: parseNutritionValue(nutrition.calories),
    protein: parseNutritionValue(nutrition.protein),
    fat: parseNutritionValue(nutrition.fat),
    carbohydrates: parseNutritionValue(nutrition.carbohydrates),
  };

  // Only return the object if at least one value was parsed
  if (
    parsed.calories === undefined &&
    parsed.protein === undefined &&
    parsed.fat === undefined &&
    parsed.carbohydrates === undefined
  ) {
    return undefined;
  }

  return parsed;
}

/**
 * Maps recipe category from schema.org to our app categories
 */
export function mapCategory(
  schemaCategory?: string | string[]
): (typeof RECIPE_CATEGORIES)[number] {
  const categories = Array.isArray(schemaCategory)
    ? schemaCategory
    : schemaCategory
      ? [schemaCategory]
      : [];

  const lowerCategories = categories.map((c) => c.toLowerCase());

  // Try to match to our categories
  if (lowerCategories.some((c) => c.includes("breakfast")))
    return "breakfast" as const;
  if (lowerCategories.some((c) => c.includes("lunch"))) return "lunch" as const;
  if (lowerCategories.some((c) => c.includes("dinner")))
    return "dinner" as const;
  if (lowerCategories.some((c) => c.includes("dessert")))
    return "dessert" as const;
  if (lowerCategories.some((c) => c.includes("appetizer")))
    return "appetizer" as const;
  if (lowerCategories.some((c) => c.includes("snack"))) return "snack" as const;
  if (lowerCategories.some((c) => c.includes("side"))) return "side" as const;
  if (
    lowerCategories.some((c) => c.includes("beverage") || c.includes("drink"))
  )
    return "beverage" as const;

  // Default to main if it's a main course or we can't determine
  return "main" as const;
}
