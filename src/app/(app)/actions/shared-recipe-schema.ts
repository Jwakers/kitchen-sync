/**
 * Shared OpenAI structured output schema for recipe parsing
 * Used by both URL and text-based recipe parsers to ensure consistent AI responses
 */

// Note: This is a utility module, not a server action
export const RECIPE_INGREDIENT_SCHEMA = {
  type: "object" as const,
  properties: {
    name: { type: "string" as const },
    amount: { type: "number" as const },
    unit: { type: "string" as const },
    preparation: { type: "string" as const },
  },
  required: ["name", "amount", "unit", "preparation"],
  additionalProperties: false,
};

export const RECIPE_METHOD_STEP_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    description: { type: "string" as const },
  },
  required: ["title", "description"],
  additionalProperties: false,
};

export const RECIPE_NUTRITION_SCHEMA = {
  type: "object" as const,
  properties: {
    calories: { type: "number" as const },
    protein: { type: "number" as const },
    fat: { type: "number" as const },
    carbohydrates: { type: "number" as const },
  },
  required: ["calories", "protein", "fat", "carbohydrates"],
  additionalProperties: false,
};

/**
 * Base recipe parsing schema - shared by both parsers
 */
export const BASE_RECIPE_PARSING_SCHEMA = {
  type: "object" as const,
  properties: {
    ingredients: {
      type: "array" as const,
      items: RECIPE_INGREDIENT_SCHEMA,
    },
    category: { type: "string" as const },
    method: {
      type: "array" as const,
      items: RECIPE_METHOD_STEP_SCHEMA,
    },
  },
  required: ["ingredients", "category", "method"],
  additionalProperties: false,
};

/**
 * Extended schema for text parsing (includes validation and metadata)
 */
export const TEXT_RECIPE_PARSING_SCHEMA = {
  type: "object" as const,
  properties: {
    success: { type: "boolean" as const },
    errorMessage: { type: "string" as const },
    title: { type: "string" as const },
    description: { type: "string" as const },
    prepTime: { type: "number" as const },
    cookTime: { type: "number" as const },
    serves: { type: "number" as const },
    category: { type: "string" as const },
    ingredients: {
      type: "array" as const,
      items: RECIPE_INGREDIENT_SCHEMA,
    },
    method: {
      type: "array" as const,
      items: RECIPE_METHOD_STEP_SCHEMA,
    },
    nutrition: RECIPE_NUTRITION_SCHEMA,
  },
  required: [
    "success",
    "errorMessage",
    "title",
    "description",
    "prepTime",
    "cookTime",
    "serves",
    "category",
    "ingredients",
    "method",
    "nutrition",
  ],
  additionalProperties: false,
};
