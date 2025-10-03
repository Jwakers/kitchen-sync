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
    .index("by_user_and_status", ["userId", "status"]),

  ingredients: defineTable({
    name: v.string(),
    displayName: v.optional(v.string()),
    foodGroup: v.optional(v.string()),
    foodSubGroup: v.optional(v.string()),
    isCustom: v.boolean(),
  }),
});
