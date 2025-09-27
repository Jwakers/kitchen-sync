// ============================================================================
// RECIPE CONSTANTS
// ============================================================================

// Recipe Categories
export const RECIPE_CATEGORIES = [
  "main",
  "dessert",
  "snack",
  "appetizer",
  "side",
  "beverage",
  "breakfast",
  "lunch",
  "dinner",
] as const;

// Preparation Options
export const PREPARATION_OPTIONS = [
  "chopped",
  "diced",
  "rough chop",
  "sliced",
  "julienned",
  "brunoise",
  "minced",
  "grated",
  "shredded",
  "cubed",
  "quartered",
  "halved",
  "whole",
  "crushed",
  "mashed",
  "pureed",
  "at room temperature",
  "chilled",
  "warmed",
  "softened",
  "melted",
  "beaten",
  "whipped",
  "folded",
  "kneaded",
  "rolled",
  "pressed",
  "strained",
  "drained",
  "rinsed",
  "peeled",
  "trimmed",
  "seeded",
  "cored",
  "stemmed",
] as const;

// Units - organized by category for better maintainability
export const UNITS = {
  volume: ["cups", "tsp", "tbsp", "fl oz", "gal", "ml", "l"],
  weight: ["lbs", "oz", "g", "kg"],
  count: ["pinch", "dash", "handful"],
} as const;

// Flattened units array for schema compatibility
export const UNITS_FLAT = [
  ...UNITS.volume,
  ...UNITS.weight,
  ...UNITS.count,
] as const;

// TypeScript types
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];
export type PreparationOption = (typeof PREPARATION_OPTIONS)[number];
export type Unit = (typeof UNITS_FLAT)[number];
