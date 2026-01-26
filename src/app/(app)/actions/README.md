# Recipe Parsing Actions

This directory contains server actions for scraping and parsing recipe data from websites using AI.

## Files

- **`parse-recipe.ts`** - Consolidated parser with shared logic for both URL and text parsing
  - Uses AI to extract recipes directly from any recipe website (primary method)
  - Uses AI to parse unstructured recipe text into structured format

## Setup

### Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Required for AI-powered parsing
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

## Usage

### Import Recipe from URL

```typescript
import { parseRecipeFromSiteWithAI } from "./actions/parse-recipe";

// Parse recipe directly from URL using AI
const parsedRecipe = await parseRecipeFromSiteWithAI(
  "https://www.allrecipes.com/recipe/23600/worlds-best-lasagna/"
);

if (!parsedRecipe) {
  console.error("Failed to extract recipe");
  return;
}

// Recipe is now ready to save to your database
console.log(parsedRecipe);
// {
//   title: "World's Best Lasagna",
//   description: "This lasagna recipe...",
//   prepTime: 30,  // minutes
//   cookTime: 150, // minutes
//   serves: 12,
//   category: "main",  // AI-determined
//   ingredients: [
//     { name: "sweet Italian sausage", amount: 1, unit: "lb" },
//     { name: "onion", amount: 0.5, unit: "cup", preparation: "minced" },
//     { name: "garlic", amount: 2, unit: "clove", preparation: "crushed" },
//     ...
//   ],
//   method: [
//     { title: "Gather ingredients", description: "Gather all your ingredients." },
//     { title: "Cook the meat", description: "Cook sausage, ground beef, onion, and garlic..." },
//     { title: "Prepare the sauce", description: "Stir in crushed tomatoes, tomato sauce..." },
//     { title: "Assemble the lasagna", description: "Spread meat sauce in baking dish..." },
//     ...
//   ],
//   imageUrl: "https://...",
//   originalUrl: "https://...",
//   originalAuthor: "...",
//   importedAt: 1234567890
// }
```

### Parse Recipe from Text

```typescript
import { parseTextToRecipe } from "./actions/parse-recipe";

const recipeText = `
Chocolate Chip Cookies

Ingredients:
- 2 cups flour
- 1 cup butter
- 1 cup sugar
- 2 eggs
- 1 tsp vanilla
- 1 cup chocolate chips

Instructions:
1. Preheat oven to 350°F
2. Mix butter and sugar
3. Add eggs and vanilla
4. Mix in flour
5. Fold in chocolate chips
6. Bake for 10-12 minutes
`;

const result = await parseTextToRecipe(recipeText);

if (!result.success) {
  console.error(result.error);
  return;
}

console.log(result.recipe);
```

## What Gets AI Processing?

GPT-4o-mini intelligently handles all aspects of recipe parsing:

### 🥘 Ingredients

- ✅ Extracts **amount** (handles fractions: 1/2 → 0.5, mixed numbers: 1 1/2 → 1.5)
- ✅ Identifies **unit** (understands variations: cup/cups, pound/lb/lbs)
- ✅ Extracts **ingredient name** (cleaned of extra text)
- ✅ Detects **preparation method** (chopped, minced, crushed, frozen, etc.)
- ✅ Handles edge cases (parenthetical notes, "divided", "or to taste", etc.)

### 📂 Category

- ✅ Intelligently categorizes recipe based on content and context
- ✅ Maps to your schema categories (breakfast, lunch, main, dessert, snack, sides, drinks)
- ✅ Understands nuance better than keyword matching

### 📝 Method Steps

- ✅ Creates **descriptive titles** for each step
- ✅ Action-oriented titles like "Prepare the sauce", "Brown the meat", "Assemble the lasagna"
- ✅ Preserves complete original instruction text

### ⏱️ Timing & Metadata

- ✅ Extracts or estimates prep and cook times
- ✅ Determines serving size
- ✅ Extracts author information and image URLs from page metadata
- ✅ Validates recipe completeness

## Cost Considerations

**GPT-4o-mini** costs approximately:

- **$0.15 per 1M input tokens**
- **$0.60 per 1M output tokens**

Average recipe with 20 ingredients and 10 steps:

- Input: ~2,000 tokens (webpage text + prompt)
- Output: ~500 tokens (structured recipe data)
- **Cost per recipe: ~$0.0006 (less than a penny)**

For 1,000 recipes: ~$0.60

Extremely affordable for consistent, high-quality parsing! 🎉

## Benefits of AI-Only Approach

✅ **Consistency** - All recipes parsed the same way regardless of source  
✅ **Robustness** - Works even when sites lack structured data  
✅ **Intelligence** - Handles edge cases and variations naturally  
✅ **Simplicity** - Single parsing path, easier to maintain and improve  
✅ **Flexibility** - Can extract recipes from any format (HTML, text, etc.)

## Error Handling

Functions handle errors gracefully:

```typescript
// URL parsing
const recipe = await parseRecipeFromSiteWithAI(url);
if (!recipe) {
  // Handle failure - page may not contain recipe or be inaccessible
}

// Text parsing with validation
const result = await parseTextToRecipe(text);
if (!result.success) {
  console.error(result.error);
  // May include partial recipe data for manual completion
  if (result.partialRecipe) {
    // User can edit and complete in UI
  }
}
```
