import { internalMutation } from "./_generated/server";

/**
 * Migration to remove the status field from all recipes
 * Run this once to clean up existing data after schema change
 */
export const removeRecipeStatusField = internalMutation({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();

    let updatedCount = 0;

    for (const recipe of recipes) {
      // Check if recipe has a status field (it will exist on old documents)
      if ("status" in recipe) {
        // Patch the recipe to remove the status field by replacing the document
        // Since Convex doesn't allow direct field deletion, we need to reconstruct
        const { status, ...recipeWithoutStatus } = recipe;

        // Delete old document and create new one with same _id
        await ctx.db.replace(recipe._id, recipeWithoutStatus);
        updatedCount++;
      }
    }

    return {
      message: `Migration complete: Updated ${updatedCount} recipes`,
      totalRecipes: recipes.length,
      updatedRecipes: updatedCount,
    };
  },
});

/**
 * Migration to remove the createdAt field from all mealPlans
 * Run this once to clean up existing data after schema change
 */
export const removeMealPlanCreatedAtField = internalMutation({
  args: {},
  handler: async (ctx) => {
    const mealPlans = await ctx.db.query("mealPlans").collect();

    let updatedCount = 0;

    for (const plan of mealPlans) {
      // Check if mealPlan has a createdAt field (it will exist on old documents)
      if ("createdAt" in plan) {
        // Remove the createdAt field by replacing the document
        // Since Convex doesn't allow direct field deletion, we need to reconstruct
        const { createdAt, ...planWithoutCreatedAt } = plan;

        // Replace the document without the createdAt field
        await ctx.db.replace(plan._id, planWithoutCreatedAt);
        updatedCount++;
      }
    }

    return {
      message: `Migration complete: Updated ${updatedCount} meal plans`,
      totalMealPlans: mealPlans.length,
      updatedMealPlans: updatedCount,
    };
  },
});
