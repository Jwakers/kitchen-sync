import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { PREPARATION_OPTIONS, RECIPE_CATEGORIES, UNITS } from "./lib/constants";

const categoriesUnion = v.union(...RECIPE_CATEGORIES.map(v.literal));
const preparationUnion = v.union(...PREPARATION_OPTIONS.map(v.literal));
const unitsUnion = v.union(...UNITS.map(v.literal));

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
    ingredients: v.array(
      v.object({
        ingredientId: v.id("ingredients"),
        amount: v.number(),
        unit: v.optional(unitsUnion),
        preparation: v.optional(preparationUnion),
      })
    ),
    method: v.array(
      v.object({
        step: v.string(),
        image: v.optional(v.id("_storage")),
      })
    ),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_user_and_category", ["userId", "category"]),

  ingredients: defineTable({
    name: v.string(),
  }),
});
