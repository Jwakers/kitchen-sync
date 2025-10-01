import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoriesUnion, preparationUnion, unitsUnion } from "./schema";
import { getCurrentUser, getCurrentUserOrThrow } from "./users";

export const getRecipe = query({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new ConvexError("User not found");
    const recipe = await ctx.db.get(args.recipeId);

    if (!recipe) return null;
    if (recipe.userId !== user._id) return null;

    let image = null;
    if (recipe.image) {
      image = await ctx.storage.getUrl(recipe.image);
    }

    return { ...recipe, image };
  },
});

export const getDraftRecipes = query({
  args: {
    cursor: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("recipes")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "draft")
      )
      .take(20);
  },
});

export const getPublishedRecipes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("recipes")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "published")
      )
      .order("desc")
      .collect();
  },
});

export const getAllUserRecipes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        image: recipe.image ? await ctx.storage.getUrl(recipe.image) : null,
      }))
    );
  },
});

export const createRecipe = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    // image: v.id("_storage"),
    prepTime: v.number(),
    cookTime: v.number(),
    serves: v.number(),
    category: categoriesUnion,
    ingredients: v.optional(
      v.array(
        v.object({
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
          step: v.string(),
          // image: v.id("_storage"),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const allUserRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const recipeTitles = allUserRecipes.map((recipe) => recipe.title);
    const draftRecipes = allUserRecipes.filter(
      (recipe) => recipe.status === "draft"
    );

    // TODO:
    // Does this name already exist for this user
    if (args.title !== "" && recipeTitles.includes(args.title)) {
      return { error: "This recipe title already exists", recipeId: null };
    }
    // Does this user have too many draft recipes
    if (draftRecipes.length >= 3) {
      return {
        error: "You can only have 3 draft recipes at a time",
        recipeId: null,
      };
    }
    // Does this user have too many recipes total (USE CLERK FEATURES FOR THIS)

    const recipeId = await ctx.db.insert("recipes", {
      userId: user._id,
      title: args.title,
      description: args.description,
      // image: args.image,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      serves: args.serves,
      category: args.category,
      //   ingredients: undefined,
      //   method: undefined,
      updatedAt: Date.now(),
      status: "draft",
    });

    return { recipeId, error: null };
  },
});

export const updateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    // image: v.id("_storage"),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    serves: v.optional(v.number()),
    category: v.optional(categoriesUnion),
    // ingredients: v.optional(
    //   v.array(
    //     v.object({
    //       name: v.string(),
    //       amount: v.number(),
    //       unit: v.optional(unitsUnion),
    //       preparation: v.optional(preparationUnion),
    //     })
    //   )
    // ),
    // method: v.optional(
    //   v.array(
    //     v.object({
    //       step: v.string(),
    //       image: v.id("_storage"),
    //     })
    //   )
    // ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.recipeId, {
      title: args.title ?? recipe.title,
      description: args.description ?? recipe.description,
      prepTime: args.prepTime ?? recipe.prepTime,
      cookTime: args.cookTime ?? recipe.cookTime,
      serves: args.serves ?? recipe.serves,
      category: args.category ?? recipe.category,
      // ingredients: args.ingredients ?? recipe.ingredients,
      // method: args.method ?? recipe.method,
    });
  },
});

export const updateRecipeImage = mutation({
  args: {
    recipeId: v.id("recipes"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.recipeId, {
      image: args.storageId,
    });
  },
});

export const publishRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    const errors: {
      field:
        | "title"
        | "prepTime"
        | "cookTime"
        | "serves"
        | "category"
        | "ingredients"
        | "method";
      message: string;
    }[] = [];

    if (!recipe.title) {
      errors.push({
        field: "title",
        message: "Title is required",
      });
    }

    if (!recipe.prepTime || recipe.prepTime < 1) {
      errors.push({
        field: "prepTime",
        message: "Prep time must be at least 1 minute",
      });
    }

    if (!recipe.cookTime || recipe.cookTime < 1) {
      errors.push({
        field: "cookTime",
        message: "Cook time must be at least 1 minute",
      });
    }

    if (!recipe.serves || recipe.serves < 1) {
      errors.push({
        field: "serves",
        message: "Must serve at least 1 person",
      });
    }

    if (!recipe.category) {
      errors.push({
        field: "category",
        message: "Category is required",
      });
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push({
        field: "ingredients",
        message: "Must have at least 1 ingredient",
      });
    }

    if (!recipe.method || recipe.method.length === 0) {
      errors.push({
        field: "method",
        message: "Must have at least 1 method step",
      });
    }

    if (errors.length > 0) return { errors, success: false };

    await ctx.db.patch(args.recipeId, {
      status: "published",
    });

    return { errors: null, success: true };
  },
});

export const deleteRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    // TODO: delete recipe image from storage
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.recipeId);
    if (recipe.image) {
      try {
        await ctx.storage.delete(recipe.image);
      } catch (e) {
        console.warn("Failed to delete image for recipe", args.recipeId, e);
      }
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getCurrentUserOrThrow(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateRecipeImageAndDeleteOld = mutation({
  args: {
    recipeId: v.id("recipes"),
    newStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    // Store the old image ID before updating
    const oldImageId = recipe.image;

    // Update recipe with new image
    await ctx.db.patch(args.recipeId, {
      image: args.newStorageId,
    });

    // Best-effort delete of the old image
    if (oldImageId) {
      try {
        await ctx.storage.delete(oldImageId);
      } catch (e) {
        console.warn("Old image delete failed", {
          recipeId: args.recipeId,
          oldImageId,
          e,
        });
      }
    }
  },
});
