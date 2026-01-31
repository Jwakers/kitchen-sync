import { ConvexError, v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { isHouseholdMember } from "./households";
import { canAccessMealPlan } from "./mealPlans";
import {
  getCurrentUser,
  getCurrentUserOrThrow,
  getUserSubscription,
} from "./users";

// ============================================================================
// HELPERS (ingredient aggregation for meal plan → shopping list)
// ============================================================================

function normaliseIngredientKey(ing: {
  name?: string;
  unit?: string;
  preparation?: string;
}): string {
  return [
    (ing?.name ?? "").trim().toLowerCase(),
    (ing?.unit ?? "").trim().toLowerCase(),
    (ing?.preparation ?? "").trim().toLowerCase(),
  ].join("|");
}

function aggregateIngredientsFromRecipes(
  recipes: { ingredients?: Doc<"recipes">["ingredients"] }[]
): { name: string; amount: number | string | null; unit?: string; preparation?: string }[] {
  const combined = new Map<
    string,
    { name: string; unit?: string; preparation?: string; amount: number | string | null }
  >();

  for (const recipe of recipes) {
    const ingredients = recipe.ingredients ?? [];
    for (const ingredient of ingredients) {
      if (!ingredient?.name) continue;
      const key = normaliseIngredientKey(ingredient);
      const existing = combined.get(key);
      const amountValue =
        ingredient.amount === undefined
          ? null
          : typeof ingredient.amount === "number"
            ? ingredient.amount
            : Number(ingredient.amount);

      if (!existing) {
        combined.set(key, {
          name: ingredient.name,
          unit: ingredient.unit,
          preparation: ingredient.preparation,
          amount: Number.isFinite(amountValue as number) ? (amountValue as number) : null,
        });
        continue;
      }
      if (
        typeof existing.amount === "number" &&
        typeof amountValue === "number" &&
        Number.isFinite(amountValue)
      ) {
        existing.amount += amountValue;
      } else if (ingredient.amount !== undefined) {
        const parts = [existing.amount, ingredient.amount]
          .filter((v) => v !== null)
          .map(String);
        existing.amount = parts.length > 0 ? parts.join(" + ") : null;
      }
    }
  }

  return Array.from(combined.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the user's active or draft shopping list (most recent one)
 */
export const getActiveShoppingList = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    // Return null if user doesn't exist yet (race condition on sign-in)
    if (!user) {
      return null;
    }

    // Get the most recent draft or active list
    const list = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_and_status", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "draft"),
          q.eq(q.field("status"), "active")
        )
      )
      .order("desc")
      .first();

    if (!list) return null;

    // Get all items for this list
    const items = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_shopping_list", (q) => q.eq("shoppingListId", list._id))
      .collect();

    // Sort by order
    const sortedItems = items.sort((a, b) => a.order - b.order);

    return {
      ...list,
      items: sortedItems,
    };
  },
});

/**
 * Get all active shopping lists for the current user (for limit checking)
 */
export const getAllActiveShoppingLists = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const activeLists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();

    return activeLists;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new shopping list in draft mode
 */
export const createShoppingList = mutation({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        amount: v.union(v.number(), v.string(), v.null()),
        unit: v.optional(v.string()),
        preparation: v.optional(v.string()),
      })
    ),
    chalkboardItemIds: v.array(v.id("chalkboardItems")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subscription = await getUserSubscription(user, ctx);

    const activeLists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();

    if (
      subscription.maxActiveShoppingLists !== -1 &&
      activeLists.length >= subscription.maxActiveShoppingLists
    ) {
      throw new ConvexError(
        `You've reached the limit of ${subscription.maxActiveShoppingLists} active shopping lists. Complete or delete an existing list to create a new one.`
      );
    }

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Create the shopping list
    const listId = await ctx.db.insert("shoppingLists", {
      userId: user._id,
      status: "draft",
      expiresAt: now + oneWeek,
      chalkboardItemIds: args.chalkboardItemIds,
    });

    // Create all items
    await Promise.all(
      args.items.map((item, i) => {
        return ctx.db.insert("shoppingListItems", {
          shoppingListId: listId,
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          preparation: item.preparation,
          checked: false,
          order: i,
        });
      })
    );

    return { listId };
  },
});

/**
 * Create a shopping list from a meal plan. User must have access to the plan (owner or shared household).
 */
export const createShoppingListFromMealPlan = mutation({
  args: {
    mealPlanId: v.id("mealPlans"),
    chalkboardItemIds: v.array(v.id("chalkboardItems")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const plan = await ctx.db.get(args.mealPlanId);
    if (!plan) throw new ConvexError("Meal plan not found");
    const allowed = await canAccessMealPlan(ctx, user._id, plan);
    if (!allowed) {
      throw new ConvexError("You do not have access to this meal plan");
    }

    const entries = await ctx.db
      .query("mealPlanEntries")
      .withIndex("by_meal_plan", (q) => q.eq("mealPlanId", args.mealPlanId))
      .collect();

    const recipeIds = [...new Set(entries.map((e) => e.recipeId))];
    const recipes = await Promise.all(
      recipeIds.map((id) => ctx.db.get(id))
    );
    const validRecipes = recipes.filter(
      (r): r is NonNullable<typeof r> => r != null
    );
    const items = aggregateIngredientsFromRecipes(validRecipes);

    const subscription = await getUserSubscription(user, ctx);
    const activeLists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();
    if (
      subscription.maxActiveShoppingLists !== -1 &&
      activeLists.length >= subscription.maxActiveShoppingLists
    ) {
      throw new ConvexError(
        `You've reached the limit of ${subscription.maxActiveShoppingLists} active shopping lists. Complete or delete an existing list to create a new one.`
      );
    }

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const listId = await ctx.db.insert("shoppingLists", {
      userId: user._id,
      status: "draft",
      expiresAt: now + oneWeek,
      chalkboardItemIds: args.chalkboardItemIds,
    });

    await Promise.all(
      items.map((item, i) =>
        ctx.db.insert("shoppingListItems", {
          shoppingListId: listId,
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          preparation: item.preparation,
          checked: false,
          order: i,
        })
      )
    );

    return { listId };
  },
});

/**
 * Update items in a draft shopping list
 */
export const updateItems = mutation({
  args: {
    listId: v.id("shoppingLists"),
    items: v.array(
      v.object({
        id: v.optional(v.id("shoppingListItems")), // Existing item ID
        name: v.string(),
        amount: v.union(v.number(), v.string(), v.null()),
        unit: v.optional(v.string()),
        preparation: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only update your own shopping lists");
    }

    if (list.status !== "draft") {
      throw new ConvexError("Can only update items in draft mode");
    }

    // Get existing items
    const existingItems = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_shopping_list", (q) => q.eq("shoppingListId", args.listId))
      .collect();

    const existingIds = new Set(existingItems.map((item) => item._id));
    const updatedIds = new Set(
      args.items.map((item) => item.id).filter((id) => id !== undefined)
    );

    // Delete items that are no longer in the list
    for (const item of existingItems) {
      if (!updatedIds.has(item._id)) {
        await ctx.db.delete(item._id);
      }
    }

    // Update or create items
    await Promise.all(
      args.items.map((item, i) => {
        if (item.id && existingIds.has(item.id)) {
          // Update existing item
          return ctx.db.patch(item.id, {
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            preparation: item.preparation,
            order: i,
          });
        } else {
          // Create new item
          return ctx.db.insert("shoppingListItems", {
            shoppingListId: args.listId,
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            preparation: item.preparation,
            checked: false,
            order: i,
          });
        }
      })
    );

    return { success: true };
  },
});

/**
 * Toggle an item's checked status
 */
export const toggleItemChecked = mutation({
  args: {
    itemId: v.id("shoppingListItems"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new ConvexError("Item not found");
    }

    const list = await ctx.db.get(item.shoppingListId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only update your own shopping lists");
    }

    await ctx.db.patch(args.itemId, {
      checked: !item.checked,
    });

    return { checked: !item.checked };
  },
});

/**
 * Update a single item's amount
 */
export const updateItemAmount = mutation({
  args: {
    itemId: v.id("shoppingListItems"),
    amount: v.union(v.number(), v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new ConvexError("Item not found");
    }

    const list = await ctx.db.get(item.shoppingListId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only update your own shopping lists");
    }

    if (list.status !== "draft") {
      throw new ConvexError("Can only update items in draft mode");
    }

    await ctx.db.patch(args.itemId, {
      amount: args.amount,
    });

    return { success: true };
  },
});

/**
 * Remove an item from the shopping list
 */
export const removeItem = mutation({
  args: {
    itemId: v.id("shoppingListItems"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new ConvexError("Item not found");
    }

    const list = await ctx.db.get(item.shoppingListId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only update your own shopping lists");
    }

    if (list.status !== "draft") {
      throw new ConvexError("Can only remove items in draft mode");
    }

    await ctx.db.delete(args.itemId);

    return { success: true };
  },
});

/**
 * Add items from chalkboard to existing shopping list
 */
export const addChalkboardItems = mutation({
  args: {
    listId: v.id("shoppingLists"),
    items: v.array(
      v.object({
        chalkboardItemId: v.id("chalkboardItems"),
        name: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only update your own shopping lists");
    }

    if (list.status !== "draft") {
      throw new ConvexError("Can only add items in draft mode");
    }

    // Get current max order
    const existingItems = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_shopping_list", (q) => q.eq("shoppingListId", args.listId))
      .collect();

    let maxOrder = existingItems.reduce(
      (max, item) => Math.max(max, item.order),
      -1
    );

    // Add new items
    await Promise.all(
      args.items.map((item, i) => {
        maxOrder++;
        return ctx.db.insert("shoppingListItems", {
          shoppingListId: args.listId,
          name: item.name,
          amount: null,
          checked: false,
          order: maxOrder,
        });
      })
    );

    // Update chalkboard item IDs
    await ctx.db.patch(args.listId, {
      chalkboardItemIds: [
        ...list.chalkboardItemIds,
        ...args.items.map((item) => item.chalkboardItemId),
      ],
    });

    return { success: true };
  },
});

/**
 * Complete a shopping list
 */
export const completeShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only complete your own shopping lists");
    }

    if (list.status !== "active") {
      throw new ConvexError("Can only complete active shopping lists");
    }

    // Mark list as completed
    await ctx.db.patch(args.listId, {
      status: "completed",
      completedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a shopping list
 */
export const deleteShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only delete your own shopping lists");
    }

    // Delete all items
    const items = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_shopping_list", (q) => q.eq("shoppingListId", args.listId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete the list
    await ctx.db.delete(args.listId);

    return { success: true };
  },
});

/**
 * Unfinalise a shopping list (go back to draft mode)
 */
export const unfinaliseShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only edit your own shopping lists");
    }

    if (list.status !== "active") {
      throw new ConvexError("Can only unfinalize active shopping lists");
    }

    // Mark list as draft
    await ctx.db.patch(args.listId, {
      status: "draft",
      finalisedAt: undefined,
    });

    return { success: true };
  },
});

/**
 * Finalize a draft shopping list, checking the active list limit
 */
export const finaliseShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const subscription = await getUserSubscription(user, ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new ConvexError("Shopping list not found");
    }

    if (list.userId !== user._id) {
      throw new ConvexError("You can only finalize your own shopping lists");
    }

    if (list.status !== "draft") {
      throw new ConvexError("Shopping list is already finalized");
    }

    // Check active shopping list limit before finalizing
    const activeLists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();

    if (
      subscription.maxActiveShoppingLists !== -1 &&
      activeLists.length >= subscription.maxActiveShoppingLists
    ) {
      throw new ConvexError(
        `You've reached the limit of ${subscription.maxActiveShoppingLists} active shopping lists. Complete an existing list before finalizing this one.`
      );
    }

    const now = Date.now();

    // Mark list as active
    await ctx.db.patch(args.listId, {
      status: "active",
      finalisedAt: now,
    });

    // Delete chalkboard items
    for (const chalkboardItemId of list.chalkboardItemIds) {
      try {
        const item = await ctx.db.get(chalkboardItemId);
        if (!item) continue;

        const canDelete =
          item.householdId === undefined
            ? item.addedBy === user._id
            : await isHouseholdMember(ctx, user._id, item.householdId);
        if (!canDelete) continue;

        await ctx.db.delete(chalkboardItemId);
      } catch (error) {
        // Item might have been deleted already, continue
        console.error("Failed to delete chalkboard item:", error);
      }
    }

    return { success: true };
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

/**
 * Clean up expired shopping lists
 */
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all expired lists
    const expiredLists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    let deletedCount = 0;

    for (const list of expiredLists) {
      // Delete all items
      const items = await ctx.db
        .query("shoppingListItems")
        .withIndex("by_shopping_list", (q) => q.eq("shoppingListId", list._id))
        .collect();

      for (const item of items) {
        await ctx.db.delete(item._id);
      }

      // Delete the list
      await ctx.db.delete(list._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});
