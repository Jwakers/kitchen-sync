"use server";

import {
  IngredientSchema,
  MethodStepSchema,
  type ParsedRecipeForDB,
  type StructuredIngredient,
} from "@/lib/types/recipe-parser";
import {
  validatePreparation,
  validateUnit,
} from "@/lib/utils/recipe-validation";
import { validateUrlForSSRF } from "@/lib/utils/secure-fetch";
import * as cheerio from "cheerio";
import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS,
} from "convex/lib/constants";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for raw HTML content parsing
const HTML_RECIPE_PARSING_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    description: { type: "string" as const },
    prepTime: { type: "number" as const },
    cookTime: { type: "number" as const },
    serves: { type: "number" as const },
    category: { type: "string" as const },
    ingredients: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          amount: { type: "number" as const },
          unit: { type: "string" as const },
          preparation: { type: "string" as const },
        },
        required: ["name", "amount", "unit", "preparation"],
        additionalProperties: false,
      },
    },
    method: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const },
          description: { type: "string" as const },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
    imageUrl: { type: "string" as const },
    author: { type: "string" as const },
  },
  required: [
    "title",
    "description",
    "prepTime",
    "cookTime",
    "serves",
    "category",
    "ingredients",
    "method",
    "imageUrl",
    "author",
  ],
  additionalProperties: false,
};

// Zod schema for validation
const HtmlRecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  prepTime: z.number(),
  cookTime: z.number(),
  serves: z.number(),
  category: z.enum(RECIPE_CATEGORIES),
  ingredients: z.array(IngredientSchema),
  method: z.array(MethodStepSchema),
  imageUrl: z.string(),
  author: z.string(),
});

/**
 * Extracts image URL from HTML meta tags
 * Checks Open Graph, Twitter Cards, and other common meta tags
 */
function extractImageFromMeta($: cheerio.CheerioAPI): string | undefined {
  // Priority order for image extraction
  const selectors = [
    // Open Graph (most common for recipe sites)
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    // Twitter Card
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
    // Schema.org meta tags
    'meta[itemprop="image"]',
    // Recipe-specific
    'link[rel="image_src"]',
  ];

  for (const selector of selectors) {
    const content = $(selector).attr("content") || $(selector).attr("href");
    if (content && content.trim()) {
      // Validate it looks like a URL
      if (content.startsWith("http") || content.startsWith("//")) {
        return content.startsWith("//") ? `https:${content}` : content;
      }
    }
  }

  return undefined;
}

/**
 * Uses AI to parse recipe from raw HTML content (fallback when schema.org parsing fails)
 * Extracts visible text from HTML and uses GPT-4o-mini to structure the recipe data
 */
async function parseHtmlWithAI(
  pageText: string,
  imageUrl?: string
): Promise<ParsedRecipeForDB | null> {
  // Generate units string from constants
  const unitsString = `Available units (CHOOSE FROM THESE ONLY): 
  Volume: ${UNITS.volume.join(", ")}
  Weight: ${UNITS.weight.join(", ")}
  Count: ${UNITS.count.join(", ")}
  Items: ${UNITS.items.join(", ")}`;

  // Generate preparations string from constants
  const preparationsString = `Available preparations (CHOOSE FROM THESE ONLY): 
  ${PREPARATION_OPTIONS.join(", ")}`;

  const systemPrompt = `You are an expert recipe parser extracting structured recipe data from webpage text.

Return a JSON object with this exact structure:
{
  "title": "string",
  "description": "string",
  "prepTime": number (in minutes),
  "cookTime": number (in minutes),
  "serves": number,
  "category": "string (one of: ${RECIPE_CATEGORIES.join(", ")})",
  "ingredients": [
    {"name": "string", "amount": number, "unit": "string", "preparation": "string"}
  ],
  "method": [
    {"title": "string (3-5 words)", "description": "string (complete instruction)"}
  ],
  "imageUrl": "string (empty string if not found)",
  "author": "string (empty string if not found)"
}

${unitsString}

${preparationsString}

CRITICAL INSTRUCTIONS:

For title (REQUIRED):
- Extract the recipe name from the page
- If not clearly stated, create a descriptive name
- NEVER leave this empty

For description (REQUIRED):
- Extract the recipe description or introduction
- If not present, generate an engaging 2-3 sentence description
- NEVER leave this empty

For timing (REQUIRED):
- Extract prep and cook times if mentioned in the text
- Convert to minutes (e.g., "1 hour 30 minutes" = 90)
- If not stated, estimate based on recipe complexity
- Use 0 for cookTime if it's a no-cook recipe
- NEVER leave these undefined

For ingredients (CRITICAL):
- Extract numeric amount (convert fractions: 1/2 = 0.5, 1/4 = 0.25, 1/3 = 0.33)
- If amount is 0, missing, or unclear, use sensible defaults:
  * Garlic cloves: use "clove" unit, amount 2-4 typical
  * Fresh herbs: use "sprig" or "bunch" or "handful"
  * Spices/seasonings: use "pinch" or "dash" or 1 tsp
  * Vegetables: use "piece" or "whole" or standard weight
  * Canned/packaged items: use "can", "jar", "packet"
- ALWAYS match units to available units above
- Extract ingredient name (without amount, unit, or preparation)
- Identify preparation method from available options
- Remove parenthetical notes like "(28 ounce)" from the name
- Remove trailing text like "divided", "or to taste", "optional"
- If an ingredient has multiple preparations, combine with commas

For method steps (VERY IMPORTANT):
- Keep ALL original instruction steps - DO NOT combine or condense
- For EACH step, create a short descriptive title (3-5 words)
- PRESERVE the COMPLETE original instruction text in the "description" field
- DO NOT shorten, summarize, or paraphrase instructions
- DO NOT merge multiple steps into one
- Titles should be action-oriented: "Prepare the sauce", "Brown the meat"
- MUST have at least one step

For category:
- Choose ONE category that best fits this recipe

For imageUrl:
- Look for recipe image URLs in the page text (might be in metadata)
- Use empty string "" if no image found

For author:
- Look for recipe author/creator name in the page text
- Use empty string "" if no author found

You MUST return valid JSON with ALL fields present.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Extract the recipe from this webpage text:\n\n${pageText}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "html_recipe_parser",
          strict: true,
          schema: HTML_RECIPE_PARSING_SCHEMA,
        },
      },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON (structured outputs ensures valid JSON)
    const jsonData = JSON.parse(content);
    const validationResult = HtmlRecipeSchema.safeParse(jsonData);

    if (!validationResult.success) {
      console.error("Schema validation failed:", validationResult.error);
      return null;
    }

    const validatedData = validationResult.data;

    // Clean up and validate units and preparations
    const cleanedIngredients: StructuredIngredient[] =
      validatedData.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: validateUnit(ing.unit),
        preparation: validatePreparation(ing.preparation),
      }));

    const recipe: ParsedRecipeForDB = {
      title: validatedData.title,
      description: validatedData.description || undefined,
      prepTime: validatedData.prepTime,
      cookTime: validatedData.cookTime,
      serves: validatedData.serves,
      category: validatedData.category,
      ingredients: cleanedIngredients,
      method: validatedData.method,
      // Prefer image extracted from meta tags over AI-extracted (more reliable)
      imageUrl: imageUrl || validatedData.imageUrl || undefined,
      originalAuthor: validatedData.author || undefined,
      importedAt: Date.now(),
    };

    return recipe;
  } catch (error) {
    console.error("Error parsing HTML with AI:", error);
    return null;
  }
}

/**
 * Parses recipe from a URL when schema.org parsing fails
 * Fetches HTML, extracts visible text, and uses AI to structure the recipe
 * This is a fallback method when structured data is not available
 */
export async function parseRecipeFromSiteWithAI(
  url: string
): Promise<ParsedRecipeForDB | null> {
  if (!url) {
    console.error("No URL provided to parseRecipeFromSiteWithAI");
    return null;
  }

  try {
    // 1️⃣ Validate URL for SSRF protection
    const validation = await validateUrlForSSRF(url);
    if (!validation.valid) {
      console.error(
        `SSRF Protection: URL validation failed - ${validation.reason}`
      );
      return null;
    }

    // 2️⃣ Fetch page HTML using native fetch (more secure than axios)
    const response = await fetch(validation.url!.toString(), {
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RecipeBot/1.0; +https://kitchen-sync.app)",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const html = await response.text();

    // 3️⃣ Load into Cheerio
    const $ = cheerio.load(html);

    // Extract image from meta tags (before removing scripts)
    const imageUrl = extractImageFromMeta($);

    // Remove script and style tags for cleaner text
    $("script, style, noscript").remove();

    // Extract text from body
    const pageText = $("body").text().replace(/\s+/g, " ").trim();

    // Truncate if too long (GPT-4o-mini has token limits)
    const truncatedText = pageText.slice(0, 15000);

    if (truncatedText.length < 100) {
      console.error("Page text too short, likely failed to fetch properly");
      return null;
    }

    // 4️⃣ Parse with AI (pass extracted image)
    const recipe = await parseHtmlWithAI(truncatedText, imageUrl);

    if (!recipe) {
      return null;
    }

    // Add source URL
    return {
      ...recipe,
      originalUrl: url,
    };
  } catch (error) {
    console.error("Error fetching or parsing recipe from URL:", error);
    return null;
  }
}
