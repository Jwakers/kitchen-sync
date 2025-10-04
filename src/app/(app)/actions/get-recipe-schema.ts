"use server";

import { validateUrlForSSRF } from "@/lib/utils/secure-fetch";
import * as cheerio from "cheerio";
import type { Recipe } from "schema-dts";

// Decode HTML entities
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };

  return text.replace(/&[#\w]+;/g, (entity) => {
    if (entities[entity]) {
      return entities[entity];
    }
    // Handle numeric entities like &#39;
    if (entity.startsWith("&#")) {
      const num = entity.slice(2, -1);
      return String.fromCharCode(parseInt(num, 10));
    }
    return entity;
  });
}

// Simplified output type for our application
export type ParsedRecipeSchema = {
  name?: string;
  description?: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  recipeIngredient?: string[];
  recipeInstructions?: string[];
  nutrition?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
  };
  author?: string;
  datePublished?: string;
  aggregateRating?: {
    ratingValue?: string | number;
    reviewCount?: number;
  };
};

async function scrapeRecipeSchema(
  url: URL
): Promise<ParsedRecipeSchema | null> {
  try {
    // Validate URL for SSRF protection
    const validation = await validateUrlForSSRF(url.toString());
    if (!validation.valid) {
      throw new Error(`SSRF Protection: ${validation.reason}`);
    }

    // Fetch the HTML using native fetch
    const response = await fetch(validation.url!.toString(), {
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Look for JSON-LD script tags containing Recipe schema
    let recipeData: ParsedRecipeSchema | null = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "{}");

        // Handle single recipe or array of schemas
        const recipes = Array.isArray(data) ? data : [data];

        for (const item of recipes) {
          // Check if this is a Recipe schema (including variants like Recipe or HowTo)
          if (
            item["@type"] === "Recipe" ||
            (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))
          ) {
            recipeData = extractRecipeData(item);
            return false; // Break the .each() loop
          }

          // Handle @graph arrays (common in WordPress sites)
          if (item["@graph"]) {
            for (const graphItem of item["@graph"]) {
              if (graphItem["@type"] === "Recipe") {
                recipeData = extractRecipeData(graphItem);
                return false;
              }
            }
          }
        }
      } catch (e) {
        // Skip malformed JSON
        console.error("Error parsing JSON-LD:", e);
      }
    });

    return recipeData;
  } catch (error) {
    console.error("Error scraping recipe:", error);
    throw error;
  }
}

function extractRecipeData(schema: Recipe): ParsedRecipeSchema {
  const recipe: ParsedRecipeSchema = {
    name:
      typeof schema.name === "string"
        ? decodeHTMLEntities(schema.name)
        : undefined,
    description:
      typeof schema.description === "string"
        ? decodeHTMLEntities(schema.description)
        : undefined,
    image: extractImageUrl(schema.image),
    prepTime: typeof schema.prepTime === "string" ? schema.prepTime : undefined,
    cookTime: typeof schema.cookTime === "string" ? schema.cookTime : undefined,
    totalTime:
      typeof schema.totalTime === "string" ? schema.totalTime : undefined,
    recipeYield: extractRecipeYield(schema.recipeYield),
    recipeCategory: extractStringOrArray(schema.recipeCategory),
    recipeCuisine: extractStringOrArray(schema.recipeCuisine),
    recipeIngredient: extractStringArray(schema.recipeIngredient),
    recipeInstructions: extractInstructions(schema.recipeInstructions),
    datePublished:
      typeof schema.datePublished === "string"
        ? schema.datePublished
        : undefined,
    author: extractAuthor(schema.author),
    nutrition: extractNutrition(schema.nutrition),
    aggregateRating: extractRating(schema.aggregateRating),
  };

  return recipe;
}

// Helper functions to extract data from schema-dts types
function extractImageUrl(image: Recipe["image"]): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first && "url" in first) {
      return typeof first.url === "string" ? first.url : undefined;
    }
  }
  if (typeof image === "object" && "url" in image) {
    return typeof image.url === "string" ? image.url : undefined;
  }
  return undefined;
}

function extractRecipeYield(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recipeYield: any
): string | undefined {
  if (!recipeYield) return undefined;
  if (typeof recipeYield === "string") return recipeYield;
  if (typeof recipeYield === "number") return recipeYield.toString();
  // Handle QuantitativeValue objects
  if (typeof recipeYield === "object" && "value" in recipeYield) {
    const value = recipeYield.value;
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
  }
  return undefined;
}

function extractStringOrArray(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): string | string[] | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const strings = value.filter(
      (v: unknown): v is string => typeof v === "string"
    );
    return strings.length > 0 ? strings : undefined;
  }
  return undefined;
}

function extractStringArray(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): string[] | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return [decodeHTMLEntities(value)];
  if (Array.isArray(value)) {
    const strings = value
      .filter((v: unknown): v is string => typeof v === "string")
      .map(decodeHTMLEntities);
    return strings.length > 0 ? strings : undefined;
  }
  return undefined;
}

function extractInstructions(
  instructions: Recipe["recipeInstructions"]
): string[] | undefined {
  if (!instructions) return undefined;

  const items = Array.isArray(instructions) ? instructions : [instructions];
  const extracted: string[] = [];

  for (const item of items) {
    if (typeof item === "string") {
      extracted.push(decodeHTMLEntities(item));
    } else if (typeof item === "object" && item && "text" in item) {
      if (typeof item.text === "string") {
        extracted.push(decodeHTMLEntities(item.text));
      }
    }
  }

  return extracted.length > 0 ? extracted : undefined;
}

function extractAuthor(author: Recipe["author"]): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") return author;
  if (Array.isArray(author)) {
    const first = author[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first && "name" in first) {
      return typeof first.name === "string" ? first.name : undefined;
    }
  }
  if (typeof author === "object" && "name" in author) {
    return typeof author.name === "string" ? author.name : undefined;
  }
  return undefined;
}

function extractNutrition(
  nutrition: Recipe["nutrition"]
): ParsedRecipeSchema["nutrition"] {
  if (!nutrition) return undefined;
  if (typeof nutrition !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nutritionData = nutrition as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValue = (val: any): string | undefined => {
    if (typeof val === "string") return val;
    if (typeof val === "number") return val.toString();
    return undefined;
  };

  return {
    calories: getValue(nutritionData.calories),
    protein: getValue(nutritionData.proteinContent || nutritionData.protein),
    fat: getValue(nutritionData.fatContent || nutritionData.fat),
    carbohydrates: getValue(
      nutritionData.carbohydrateContent || nutritionData.carbohydrates
    ),
  };
}

function extractRating(
  rating: Recipe["aggregateRating"]
): ParsedRecipeSchema["aggregateRating"] {
  if (!rating) return undefined;
  if (typeof rating !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ratingData = rating as any;
  const ratingValue = ratingData.ratingValue;
  const reviewCount = ratingData.reviewCount;

  return {
    ratingValue:
      typeof ratingValue === "string" || typeof ratingValue === "number"
        ? ratingValue
        : undefined,
    reviewCount: typeof reviewCount === "number" ? reviewCount : undefined,
  };
}

export async function getRecipeSchema(url: string) {
  try {
    const validatedUrl = new URL(url);
    const recipe = await scrapeRecipeSchema(validatedUrl);

    return { error: null, recipe, url };
  } catch (error) {
    console.error("Failed to scrape recipe:", error);
    return { error: "Failed to scrape recipe", recipe: null, url: null };
  }
}
