"use server";

import { Doc } from "convex/_generated/dataModel";
import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS_FLAT,
} from "convex/lib/constants";
import OpenAI from "openai";
import { z } from "zod";
import type { ParsedRecipeSchema } from "./get-recipe-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schemas for structured output
const IngredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string().optional(),
  preparation: z.string().optional(),
});

const MethodStepSchema = z.object({
  title: z.string().describe("Short descriptive title (3-5 words)"),
  description: z.string().describe("Complete original instruction text"),
});

const RecipeDataSchema = z.object({
  ingredients: z
    .array(IngredientSchema)
    .describe(
      "Parsed ingredients with amounts, units, and preparation methods"
    ),
  category: z.enum(RECIPE_CATEGORIES).describe("Recipe category"),
  method: z
    .array(MethodStepSchema)
    .describe("Method steps with titles and complete original descriptions"),
});

// Type for the structured ingredient output
type StructuredIngredient = NonNullable<Doc<"recipes">["ingredients"]>[number];

// Helper to validate and map units to canonical values
function validateUnit(unit?: string): (typeof UNITS_FLAT)[number] | undefined {
  if (!unit) return undefined;

  const normalized = unit.toLowerCase().trim();

  // Direct match
  if ((UNITS_FLAT as readonly string[]).includes(normalized)) {
    return normalized as (typeof UNITS_FLAT)[number];
  }

  // Common variations and plural forms
  const unitMap: Record<string, (typeof UNITS_FLAT)[number]> = {
    // Volume
    cup: "cups",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    "fluid ounce": "fl oz",
    "fluid ounces": "fl oz",
    gallon: "gal",
    gallons: "gal",
    milliliter: "ml",
    milliliters: "ml",
    millilitre: "ml",
    millilitres: "ml",
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    pint: "pt",
    pints: "pt",
    quart: "qt",
    quarts: "qt",
    // Weight
    pound: "lbs",
    pounds: "lbs",
    lb: "lbs",
    ounce: "oz",
    ounces: "oz",
    gram: "g",
    grams: "g",
    gramme: "g",
    grammes: "g",
    kilogram: "kg",
    kilograms: "kg",
    kilogramme: "kg",
    kilogrammes: "kg",
    milligram: "mg",
    milligrams: "mg",
    // Count
    pinches: "pinch",
    dashes: "dash",
    handfuls: "handful",
    drops: "drop",
    // Abstract/Items
    pieces: "piece",
    pcs: "piece",
    pc: "piece",
    cloves: "clove",
    slices: "slice",
    sheets: "sheet",
    sprigs: "sprig",
    stalks: "stalk",
    stems: "stem",
    heads: "head",
    bunches: "bunch",
    bulbs: "bulb",
    wedges: "wedge",
    cubes: "cube",
    strips: "strip",
    fillets: "fillet",
    leaves: "leaf",
    cans: "can",
    jars: "jar",
    packets: "packet",
    pkts: "packet",
    packages: "package",
    pkgs: "package",
    containers: "container",
    bottles: "bottle",
    bags: "bag",
    boxes: "box",
    loaves: "loaf",
    sticks: "stick",
    squares: "square",
    rounds: "round",
    breasts: "breast",
    thighs: "thigh",
    legs: "leg",
    racks: "rack",
  };

  return unitMap[normalized];
}

// Helper to validate and map preparations to canonical values
function validatePreparation(
  prep?: string
): (typeof PREPARATION_OPTIONS)[number] | undefined {
  if (!prep) return undefined;

  const normalized = prep.toLowerCase().trim();

  // Direct match
  if ((PREPARATION_OPTIONS as readonly string[]).includes(normalized)) {
    return normalized as (typeof PREPARATION_OPTIONS)[number];
  }

  // Common variations
  const prepMap: Record<string, (typeof PREPARATION_OPTIONS)[number]> = {
    chop: "chopped",
    "finely chop": "finely chopped",
    "roughly chop": "roughly chopped",
    dice: "diced",
    "finely dice": "finely diced",
    slice: "sliced",
    "thinly slice": "thinly sliced",
    "thickly slice": "thickly sliced",
    julienne: "julienned",
    mince: "minced",
    grate: "grated",
    "finely grate": "finely grated",
    shred: "shredded",
    cube: "cubed",
    quarter: "quartered",
    halve: "halved",
    crush: "crushed",
    mash: "mashed",
    puree: "pureed",
    beat: "beaten",
    whip: "whipped",
    fold: "folded",
    knead: "kneaded",
    roll: "rolled",
    press: "pressed",
    strain: "strained",
    drain: "drained",
    rinse: "rinsed",
    peel: "peeled",
    trim: "trimmed",
    seed: "seeded",
    core: "cored",
    stem: "stemmed",
    zest: "zested",
    debone: "de-boned",
    "de-bone": "de-boned",
    fillet: "filleted",
    butterfly: "butterflied",
    blanch: "blanched",
    toast: "toasted",
    roast: "roasted",
    caramelize: "caramelized",
    caramelise: "caramelized",
    sauté: "sautéed",
    saute: "sautéed",
    fry: "fried",
    poach: "poached",
    grill: "grilled",
    boil: "boiled",
    steam: "steamed",
    smoke: "smoked",
    freeze: "frozen",
    defrost: "defrosted",
    thaw: "defrosted",
  };

  return prepMap[normalized];
}

// Type for the complete parsed recipe ready for Convex
export type ParsedRecipeForDB = {
  title: string;
  description?: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  serves: number;
  category: (typeof RECIPE_CATEGORIES)[number];
  imageUrl: string | undefined;
  ingredients: StructuredIngredient[];
  method: Array<{
    title: string;
    description?: string;
  }>;
  // Attribution & Source Information
  originalUrl?: string; // URL where recipe was imported from
  originalAuthor?: string; // Original recipe author/creator
  importedAt?: number; // Timestamp when recipe was imported
  originalPublishedDate?: string; // Original publication date from source
  // Additional metadata from source
  nutrition?: {
    calories?: number; // in grams
    protein?: number; // in grams
    fat?: number; // in grams
    carbohydrates?: number; // in grams
  };
  rating?: {
    value?: string | number; // Rating value (e.g., 4.8)
    count?: number; // Number of ratings/reviews
  };
};

/**
 * Converts ISO 8601 duration to minutes
 * Examples: "PT30M" -> 30, "PT1H30M" -> 90, "PT2H" -> 120
 */
function parseDuration(duration?: string): number {
  if (!duration) return 0;

  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
}

/**
 * Extracts serving count from recipeYield string
 * Examples: "12" -> 12, "Serves 4" -> 4, "4-6 servings" -> 4
 */
function parseServings(recipeYield?: string): number {
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
function parseNutritionValue(value?: string): number | undefined {
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
function parseNutritionData(nutrition?: {
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrates?: string;
}): ParsedRecipeForDB["nutrition"] {
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
function mapCategory(
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

/**
 * Uses GPT-4o-mini to parse recipe data with AI
 */
async function parseRecipeDataWithAI(
  recipeName: string,
  recipeDescription: string | undefined,
  schemaCategory: string | string[] | undefined,
  ingredients: string[],
  instructions: string[]
): Promise<{
  ingredients: StructuredIngredient[];
  category: (typeof RECIPE_CATEGORIES)[number];
  method: Array<{ title: string; description?: string }>;
} | null> {
  const systemPrompt = `You are an expert recipe parser. Parse the provided recipe data and return a JSON object with this exact structure:

{
  "ingredients": [
    {"name": "string", "amount": number, "unit": "string (optional)", "preparation": "string (optional)"}
  ],
  "category": "string (one of: ${RECIPE_CATEGORIES.join(", ")})",
  "method": [
    {"title": "string (3-5 words)", "description": "string (complete original instruction)"}
  ]
}

Available units (CHOOSE FROM THESE ONLY): 
  Volume: cups, tsp, tbsp, fl oz, gal, ml, l, pt, qt
  Weight: lbs, oz, g, kg, mg
  Count: pinch, dash, handful, drop
  Items: piece, whole, clove, slice, sheet, sprig, stalk, stem, head, bunch, bulb, wedge, cube, strip, fillet, leaf, can, jar, packet, package, container, bottle, bag, box, loaf, stick, square, round, breast, thigh, leg, rack

Available preparations (CHOOSE FROM THESE ONLY): 
  Cutting: chopped, finely chopped, roughly chopped, diced, finely diced, sliced, thinly sliced, thickly sliced, julienned, minced, grated, finely grated, shredded, cubed, quartered, halved
  Temperature: room temperature, chilled, warmed, softened, melted, frozen, defrosted
  Processing: beaten, whipped, peeled, trimmed, seeded, cored, stemmed, zested, de-boned, filleted, butterflied, drained, rinsed, strained, pressed
  Pre-cooked: blanched, toasted, roasted, caramelized, sautéed, fried, poached, grilled, boiled, steamed, smoked
  Other: whole, crushed, mashed, pureed, fresh, dried

CRITICAL INSTRUCTIONS:

For ingredients:
- Extract numeric amount (convert fractions to decimals: 1/2 = 0.5, 1/4 = 0.25, 1/3 = 0.33)
- If amount is 0, missing, or unclear, use sensible defaults:
  * Garlic cloves: use "clove" unit, amount based on recipe (2-4 typical)
  * Fresh herbs (basil, parsley, cilantro): use "sprig" or "bunch" or "handful"
  * Spices/seasonings (salt, pepper): use "pinch" or "dash" or 1 tsp
  * Vegetables (onion): use "piece" or "whole" or standard weight
  * Canned/packaged items: use "can", "jar", "packet", etc.
  * Other ingredients: estimate based on typical recipe amounts
- ALWAYS try to match units to available units above
- For items like "2 chicken breasts" use amount: 2, unit: "breast"
- For items like "1 head of lettuce" use amount: 1, unit: "head"  
- Extract ingredient name (without amount, unit, or preparation)
- Identify preparation method from available options (or omit if none matches)
- Remove parenthetical notes like "(28 ounce)" from the name
- Remove trailing text like "divided", "or to taste", "optional"

For nutrition information (if available in the recipe data):
- Values should be returned as integers representing grams (for protein, fat, carbs) or units (for calories)
- If a range is present (e.g., "10-15g"), use the higher value or middle value if it's a wide range
- Convert units as needed (e.g., mg to g: divide by 1000)
- If nutrition values are unclear or missing, use your best judgment based on typical values for this type of recipe accounting for ingredients used
- Round up to the nearest whole number

For category:
- Choose ONE category from the available categories that best fits this recipe

For method steps (VERY IMPORTANT):
- Keep ALL original instruction steps - DO NOT combine or condense them
- For EACH step, create a short descriptive title (3-5 words)
- PRESERVE the COMPLETE original instruction text in the "description" field
- DO NOT shorten, summarize, or paraphrase the original instruction text
- DO NOT merge multiple steps into one
- Titles should be action-oriented: "Prepare the sauce", "Brown the meat", "Preheat the oven"

You MUST return valid JSON.`;

  try {
    const categoryContext = Array.isArray(schemaCategory)
      ? schemaCategory.join(", ")
      : schemaCategory || "unknown";

    const userPrompt = `Recipe: ${recipeName}
${recipeDescription ? `Description: ${recipeDescription}` : ""}
Schema Category: ${categoryContext}

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join("\n")}

Instructions (${instructions.length} steps - KEEP ALL ${instructions.length} STEPS, DO NOT CONDENSE):
${instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}

IMPORTANT: Return exactly ${instructions.length} method steps. Copy each instruction text completely into the description field.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and accurate - best for structured parsing
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate with Zod
    const jsonData = JSON.parse(content);
    const validatedData = RecipeDataSchema.parse(jsonData);

    // Clean up and validate units and preparations
    const cleanedIngredients: StructuredIngredient[] =
      validatedData.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: validateUnit(ing.unit),
        preparation: validatePreparation(ing.preparation),
      }));

    return {
      ingredients: cleanedIngredients,
      category: validatedData.category,
      method: validatedData.method,
    };
  } catch (error) {
    console.error("Error parsing recipe with AI:", error);
    return null;
  }
}

/**
 * Parses recipe schema data into a format ready for your Convex database
 * Uses AI for intelligent parsing of ingredients, category, and method
 */
export async function parseRecipeWithAI(
  schema: ParsedRecipeSchema,
  originalUrl?: string
): Promise<ParsedRecipeForDB | null> {
  if (!schema.name) {
    return null;
  }

  const ingredientStrings = schema.recipeIngredient || [];
  const instructionStrings = schema.recipeInstructions || [];

  // Parse with AI
  const aiResult = await parseRecipeDataWithAI(
    schema.name,
    schema.description,
    schema.recipeCategory,
    ingredientStrings,
    instructionStrings
  );

  // Fallback to rule-based parsing if AI fails
  const ingredients =
    aiResult?.ingredients ||
    ingredientStrings.map((ing) => ({ name: ing, amount: 1 }));

  const category = aiResult?.category || mapCategory(schema.recipeCategory);

  const method =
    aiResult?.method ||
    instructionStrings.map((instruction, index) => ({
      title: `Step ${index + 1}`,
      description: instruction,
    }));

  const recipe: ParsedRecipeForDB = {
    title: schema.name,
    description: schema.description,
    prepTime: parseDuration(schema.prepTime),
    cookTime: parseDuration(schema.cookTime),
    serves: parseServings(schema.recipeYield),
    category: category as (typeof RECIPE_CATEGORIES)[number],
    imageUrl: schema.image,
    ingredients,
    method,
    // Attribution & Source Information
    originalUrl,
    originalAuthor: schema.author,
    importedAt: Date.now(), // Current timestamp when recipe is imported
    originalPublishedDate: schema.datePublished,
    // Additional metadata - parse nutrition values to integers (grams)
    nutrition: parseNutritionData(schema.nutrition),
    rating: schema.aggregateRating
      ? {
          value: schema.aggregateRating.ratingValue,
          count: schema.aggregateRating.reviewCount,
        }
      : undefined,
  };

  return recipe;
}
