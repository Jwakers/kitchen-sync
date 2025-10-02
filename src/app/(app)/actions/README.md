# Recipe Parsing Actions

This directory contains server actions for scraping and parsing recipe data from websites.

## Files

- **`get-recipe-schema.ts`** - Scrapes Schema.org Recipe data from any recipe website
- **`parse-recipe-with-ai.ts`** - Uses GPT-4o-mini to intelligently parse recipe data into your database schema

## Setup

### Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Required for AI-powered parsing
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

## Usage

### Complete Workflow: Import Recipe from URL

```typescript
import { getRecipeSchema } from "./actions.ts/get-recipe-schema";
import { parseRecipeWithAI } from "./actions.ts/parse-recipe-with-ai";

// 1. Scrape the recipe from a URL
const { recipe, url, error } = await getRecipeSchema(
  "https://www.allrecipes.com/recipe/23600/worlds-best-lasagna/"
);

if (error || !recipe) {
  console.error("Failed to scrape recipe");
  return;
}

// 2. Parse with AI into your database format
const parsedRecipe = await parseRecipeWithAI(recipe, url);

if (!parsedRecipe) {
  console.error("Failed to parse recipe");
  return;
}

// 3. Save to Convex
// parsedRecipe is now ready to insert into your Convex database
console.log(parsedRecipe);
// {
//   title: "World's Best Lasagna",
//   description: "This lasagna recipe...",
//   prepTime: 30,  // minutes
//   cookTime: 150, // minutes
//   serves: 12,
//   category: "dinner",  // AI-determined
//   ingredients: [
//     { name: "sweet Italian sausage", amount: 1, unit: "lbs" },
//     { name: "onion", amount: 0.5, unit: "cups", preparation: "minced" },
//     { name: "garlic", amount: 2, preparation: "crushed" },
//     ...
//   ],
//   method: [
//     { title: "Gather ingredients", description: "Gather all your ingredients." },
//     { title: "Cook the meat", description: "Cook sausage, ground beef, onion, and garlic..." },
//     { title: "Prepare the sauce", description: "Stir in crushed tomatoes, tomato sauce..." },
//     { title: "Assemble the lasagna", description: "Spread meat sauce in baking dish..." },
//     ...
//   ]
// }
```

## What Gets AI Processing?

GPT-4o-mini intelligently handles:

### 🥘 Ingredients

- ✅ Extracts **amount** (handles fractions: 1/2 → 0.5, mixed numbers: 1 1/2 → 1.5)
- ✅ Identifies **unit** (understands variations: cup/cups, pound/lb/lbs)
- ✅ Extracts **ingredient name** (cleaned of extra text)
- ✅ Detects **preparation method** (chopped, minced, crushed, etc.)
- ✅ Handles edge cases (parenthetical notes, "divided", "or to taste", etc.)

### 📂 Category

- ✅ Intelligently categorizes recipe based on name, description, and ingredients
- ✅ Maps to your schema categories (breakfast, lunch, dinner, dessert, etc.)
- ✅ Considers context better than simple keyword matching

### 📝 Method Steps

- ✅ Creates **descriptive titles** for each step (not just "Step 1", "Step 2")
- ✅ Action-oriented titles like "Prepare the sauce", "Brown the meat", "Assemble the lasagna"
- ✅ Preserves original instruction text as description

**Rule-based extraction** (no AI needed):

- Title, description, image URLs
- Time durations (ISO 8601 → minutes conversion)
- Servings (pattern extraction)
- Author, dates, nutrition, ratings

## Cost Considerations

**GPT-4o-mini** costs approximately:

- **$0.15 per 1M input tokens**
- **$0.60 per 1M output tokens**

Average recipe with 20 ingredients and 10 steps:

- Input: ~800 tokens (recipe context + ingredients + instructions)
- Output: ~500 tokens (structured ingredients + category + method titles)
- **Cost per recipe: ~$0.0004 (less than half a penny)**

For 1,000 recipes: ~$0.40

Still extremely affordable for the intelligence gained! 🎉

## Error Handling

Both functions handle errors gracefully with automatic fallbacks:

```typescript
// Scraping errors
const { error, recipe } = await getRecipeSchema(url);
if (error) {
  // Handle scraping failure
}

// AI parsing with automatic fallbacks
const parsed = await parseRecipeWithAI(recipe);
// Even on AI failure, you'll get a valid structure:
// - Ingredients: basic structure with name and amount: 1
// - Category: rule-based keyword matching
// - Method: generic "Step 1", "Step 2" titles
```
