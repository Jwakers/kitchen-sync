import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  PREPARATION_OPTIONS,
  RECIPE_CATEGORIES,
  UNITS_FLAT,
} from "./lib/constants";

const categoriesUnion = v.union(...RECIPE_CATEGORIES.map(v.literal));
const preparationUnion = v.union(...PREPARATION_OPTIONS.map(v.literal));
const unitsUnion = v.union(...UNITS_FLAT.map(v.literal));

export { categoriesUnion, preparationUnion, unitsUnion };

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
  }).index("byExternalId", ["externalId"]),

  recipes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    prepTime: v.number(),
    cookTime: v.optional(v.number()),
    serves: v.number(),
    category: categoriesUnion,
    ingredients: v.optional(
      v.array(
        v.object({
          ingredientId: v.optional(v.id("ingredients")),
          name: v.string(),
          amount: v.number(),
          unit: v.optional(unitsUnion),
          preparation: v.optional(preparationUnion),
        })
      )
    ),
    method: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.optional(v.string()),
          image: v.optional(v.id("_storage")),
        })
      )
    ),
    updatedAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
    // Attribution & Source Information
    originalUrl: v.optional(v.string()), // URL where recipe was imported from
    originalAuthor: v.optional(v.string()), // Original recipe author/creator
    importedAt: v.optional(v.number()), // Timestamp when recipe was imported
    originalPublishedDate: v.optional(v.number()), // Original publication date from source
    nutrition: v.optional(
      v.object({
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        fat: v.optional(v.number()),
        carbohydrates: v.optional(v.number()),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_user_and_category", ["userId", "category"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_status_updatedAt", ["userId", "status", "updatedAt"]),

  ingredients: defineTable({
    name: v.string(),
    displayName: v.optional(v.string()),
    foodGroup: v.optional(v.string()),
    foodSubGroup: v.optional(v.string()),
    isCustom: v.boolean(),
  }),

  households: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"])
    .index("by_user_and_household", ["userId", "householdId"]),

  householdInvitations: defineTable({
    householdId: v.id("households"),
    invitedByUserId: v.id("users"),
    invitedUserId: v.optional(v.id("users")), // Set when invitation is accepted
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired")
    ),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_token", ["token"])
    .index("by_user", ["invitedUserId"])
    .index("by_status", ["status"]),

  householdRecipes: defineTable({
    householdId: v.id("households"),
    recipeId: v.id("recipes"),
    sharedByUserId: v.id("users"),
    sharedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_recipe", ["recipeId"])
    .index("by_household_and_recipe", ["householdId", "recipeId"]),

  chalkboardItems: defineTable({
    text: v.string(),
    addedBy: v.id("users"),
    householdId: v.optional(v.id("households")),
  })
    .index("by_user", ["addedBy"])
    .index("by_household", ["householdId"])
    .index("by_user_and_household", ["addedBy", "householdId"]),

  shoppingLists: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
    finalisedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(), // Auto-delete after 1 week
    // Track chalkboard items to delete on finalization
    chalkboardItemIds: v.array(v.id("chalkboardItems")),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_expires", ["expiresAt"]),

  shoppingListItems: defineTable({
    shoppingListId: v.id("shoppingLists"),
    name: v.string(),
    amount: v.union(v.number(), v.string(), v.null()),
    unit: v.optional(v.string()),
    preparation: v.optional(v.string()),
    checked: v.boolean(),
    order: v.number(), // Preserve item order
  }).index("by_shopping_list", ["shoppingListId"]),
});
