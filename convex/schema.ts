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
    cookTime: v.number(),
    serves: v.number(),
    category: categoriesUnion,
    ingredients: v.optional(
      v.array(
        v.object({
          ingredientId: v.id("ingredients"),
          amount: v.number(),
          unit: v.optional(unitsUnion),
          preparation: v.optional(preparationUnion),
        })
      )
    ),
    method: v.optional(
      v.array(
        v.object({
          step: v.string(),
          image: v.optional(v.id("_storage")),
        })
      )
    ),
    updatedAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_user_and_category", ["userId", "category"])
    .index("by_user_and_status", ["userId", "status"]),

  ingredients: defineTable({
    name: v.string(),
    foodGroup: v.string(),
    foodSubGroup: v.string(),
    isCustom: v.boolean(),
  }),
});
