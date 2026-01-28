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
  // Cutting styles
  "chopped",
  "finely chopped",
  "roughly chopped",
  "diced",
  "finely diced",
  "rough chop",
  "sliced",
  "thinly sliced",
  "thickly sliced",
  "chiffonade",
  "julienned",
  "brunoise",
  "minced",
  "grated",
  "finely grated",
  "shredded",
  "cubed",
  "quartered",
  "halved",
  "whole",
  "crushed",
  "mashed",
  "pureed",
  // Temperature states
  "room temperature",
  "chilled",
  "warmed",
  "softened",
  "melted",
  "frozen",
  "defrosted",
  // Processing methods
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
  "zested",
  "de-boned",
  "filleted",
  "butterflied",
  // Cooking methods (pre-cooked ingredients)
  "blanched",
  "toasted",
  "roasted",
  "caramelized",
  "sautéed",
  "fried",
  "poached",
  "grilled",
  "boiled",
  "steamed",
  "smoked",
  // Freshness states
  "fresh",
  "dried",
] as const;

// Units - organised by category for better maintainability
export const UNITS = {
  volume: ["cups", "tsp", "tbsp", "fl oz", "gal", "ml", "l", "pt", "qt"],
  weight: ["lbs", "oz", "g", "kg", "mg"],
  count: ["pinch", "dash", "handful", "drop"],
  // Abstract/item-based measurements
  items: [
    "piece",
    "whole",
    "clove",
    "slice",
    "sheet",
    "sprig",
    "stalk",
    "stem",
    "head",
    "bunch",
    "bulb",
    "wedge",
    "cube",
    "strip",
    "fillet",
    "leaf",
    "can",
    "jar",
    "packet",
    "package",
    "container",
    "bottle",
    "bag",
    "box",
    "loaf",
    "stick",
    "square",
    "round",
    "breast",
    "thigh",
    "leg",
    "rack",
  ],
} as const;

// Flattened units array for schema compatibility
export const UNITS_FLAT = [
  ...UNITS.volume,
  ...UNITS.weight,
  ...UNITS.count,
  ...UNITS.items,
] as const;

// TypeScript types
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];
export type PreparationOption = (typeof PREPARATION_OPTIONS)[number];
export type Unit = (typeof UNITS_FLAT)[number];

// Property names should match clerk subscription tiers
export const SUBSCRIPTION_TIERS = ["free_user", "pro_user"] as const;
type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

type PlanLimits = {
  maxRecipes: number;
  maxHouseholds: number;
  maxActiveShoppingLists: number;
};

/** Plan limits by subscription tier. Use -1 to represent unlimited. */
export const PLANS: Record<SubscriptionTier, PlanLimits> = {
   free_user: {
     maxRecipes: 15,
     maxHouseholds: 1,
     maxActiveShoppingLists: 3,
   },
   pro_user: {
     maxRecipes: -1, // unlimited
     maxHouseholds: -1, // unlimited
     maxActiveShoppingLists: -1, // unlimited
   },
} as const satisfies Record<SubscriptionTier, PlanLimits>;

export const FREE_TIER_LIMITS = PLANS.free_user;

// ============================================================================
// APP LIMITS & RESTRICTIONS
// Single source of truth for all limits, restrictions, and validations
// ============================================================================

/**
 * Image upload limits
 */
export const IMAGE_LIMITS = {
  /** Maximum file size for image uploads in bytes (10MB) */
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  /** Maximum file size for image uploads in MB (for display) */
  MAX_FILE_SIZE_MB: 10,
  /** Allowed image MIME types */
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ] as const,
} as const;

/**
 * Text input limits
 */
export const TEXT_LIMITS = {
  /** Maximum length for chalkboard items */
  CHALKBOARD_MAX_LENGTH: 100,
  /** Minimum length for recipe text parsing */
  RECIPE_TEXT_MIN_LENGTH: 50,
  /** Maximum length for recipe text parsing */
  RECIPE_TEXT_MAX_LENGTH: 6000,
} as const;

/**
 * Recipe limits
 */
export const RECIPE_LIMITS = {
  /** Pagination limit for recipe listings */
  PAGINATION_LIMIT: 20,
  /** Maximum number of images for photo recipe import */
  MAX_PHOTO_IMAGES: 3,
} as const;

/**
 * Image compression settings
 */
export const IMAGE_COMPRESSION = {
  /** File size threshold (bytes) above which images should be compressed */
  COMPRESSION_THRESHOLD_BYTES: 2 * 1024 * 1024, // 2MB
  /** Maximum width for compressed images (pixels) */
  MAX_WIDTH: 2000,
  /** JPEG quality for compression (0-1) */
  QUALITY: 0.8,
} as const;
