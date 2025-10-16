import { ConvexError, v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { canAccessRecipe } from "./households";
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

    // Check if user can access this recipe (owns it or it's shared to their household)
    const { canAccess, isOwner } = await canAccessRecipe(
      ctx,
      user._id,
      args.recipeId
    );
    if (!canAccess) return null;

    let image = null;
    if (recipe.image) {
      image = await ctx.storage.getUrl(recipe.image);
    }

    // Convert method step images from storage IDs to URLs
    const methodWithUrls = await Promise.all(
      (recipe.method ?? []).map(async (step) => {
        if (step.image) {
          const stepImageUrl = await ctx.storage.getUrl(step.image);
          return { ...step, imageUrl: stepImageUrl };
        }
        return { ...step, imageUrl: undefined };
      })
    );

    // Get owner name if not the current user
    let ownerName = null;
    if (!isOwner) {
      const owner = await ctx.db.get(recipe.userId);
      ownerName = owner?.name ?? "Unknown User";
    }

    return { ...recipe, image, method: methodWithUrls, isOwner, ownerName };
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

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get draft recipes (unfinished)
    const draftRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "draft")
      )
      .order("desc")
      .take(3);

    // Get recently updated published recipes (last 7 days)
    const recentRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "published")
      )
      .filter((q) => q.gte(q.field("updatedAt"), sevenDaysAgo))
      .order("desc")
      .take(5);

    // Process images for both sets
    const processRecipes = async (recipes: Doc<"recipes">[]) => {
      return await Promise.all(
        recipes.map(async (recipe) => ({
          ...recipe,
          image: recipe.image ? await ctx.storage.getUrl(recipe.image) : null,
        }))
      );
    };

    const [drafts, recent] = await Promise.all([
      processRecipes(draftRecipes),
      processRecipes(recentRecipes),
    ]);

    return {
      drafts,
      recent,
    };
  },
});

export const createDraftRecipe = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const draftRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user._id).eq("status", "draft")
      )
      .collect();

    // Does this user have too many draft recipes
    if (draftRecipes.length >= 3) {
      return {
        error: "You can only have 3 draft recipes at a time",
        recipeId: null,
      };
    }

    // TODO: Does this user have too many recipes total (USE CLERK FEATURES FOR THIS)

    const recipeId = await ctx.db.insert("recipes", {
      userId: user._id,
      title: "",
      prepTime: 0,
      cookTime: undefined,
      serves: 0,
      category: "main",
      updatedAt: Date.now(),
      status: "draft",
    });

    return { recipeId, error: null };
  },
});

export const createRecipe = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    prepTime: v.number(),
    cookTime: v.optional(v.number()),
    serves: v.number(),
    category: categoriesUnion,
    ingredients: v.array(
      v.object({
        name: v.string(),
        amount: v.number(),
        unit: v.optional(unitsUnion),
        preparation: v.optional(preparationUnion),
      })
    ),
    method: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        image: v.optional(v.id("_storage")),
      })
    ),
    nutrition: v.optional(
      v.object({
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        fat: v.optional(v.number()),
        carbohydrates: v.optional(v.number()),
      })
    ),
    originalUrl: v.optional(v.string()),
    originalAuthor: v.optional(v.string()),
    originalPublishedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    let ingredients = args.ingredients;
    // Map ingredients to database ingredients if possible
    if (ingredients?.length) {
      const allIngredients = await ctx.db.query("ingredients").collect();
      const ingredientMap = new Map(
        allIngredients.map((ing) => [ing.name.trim().toLowerCase(), ing._id])
      );

      ingredients = ingredients.map((ing) => {
        const ingredientId = ingredientMap.get(ing.name.trim().toLowerCase());

        return {
          ...ing,
          ingredientId,
        };
      });
    }

    const now = Date.now();
    let originalPublishedDate: number | undefined;
    if (args.originalPublishedDate) {
      const parsedDate = new Date(args.originalPublishedDate);
      if (isNaN(parsedDate.getTime())) {
        throw new ConvexError("Invalid originalPublishedDate format");
      }
      originalPublishedDate = parsedDate.getTime();
    }

    const recipeId = await ctx.db.insert("recipes", {
      userId: user._id,
      title: args.title,
      description: args.description,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      serves: args.serves,
      category: args.category,
      ingredients,
      method: args.method,
      nutrition: args.nutrition,
      originalUrl: args.originalUrl,
      originalAuthor: args.originalAuthor,
      importedAt: args.originalUrl ? now : undefined,
      originalPublishedDate,
      updatedAt: now,
      status: "draft",
    });

    const recipe = await ctx.db.get(recipeId);
    if (!recipe) throw new ConvexError("Recipe not found");

    const errors = _validateRecipe(recipe);

    if (errors.length > 0) return { recipeId, errors, published: false };

    await ctx.db.patch(recipe._id, {
      status: "published",
    });

    return { recipeId, errors: null, published: true };
  },
});

export const updateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    serves: v.optional(v.number()),
    category: v.optional(categoriesUnion),
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
          title: v.string(),
          description: v.optional(v.string()),
          image: v.optional(v.id("_storage")),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorised - only the recipe owner can edit it");
    }

    let ingredients = recipe.ingredients;
    // Map ingredients to database ingredients if possible
    if (args.ingredients?.length) {
      const allIngredients = await ctx.db.query("ingredients").collect();
      const ingredientMap = new Map(
        allIngredients.map((ing) => [ing.name.trim().toLowerCase(), ing._id])
      );

      ingredients = await Promise.all(
        args.ingredients.map((ing) => {
          const ingredientId = ingredientMap.get(ing.name.trim().toLowerCase());

          return {
            ...ing,
            ingredientId,
          };
        })
      );
    }

    // Clean up orphaned method step images when method is updated
    if (args.method && recipe.method) {
      const oldImageIds = new Set(
        recipe.method.map((step) => step.image).filter((img) => !!img)
      );

      const newImageIds = new Set(
        args.method.map((step) => step.image).filter((img) => !!img)
      );

      // Delete images that are no longer referenced
      const imagesToDelete = [...oldImageIds].filter(
        (id) => id && !newImageIds.has(id)
      );

      for (const imageId of imagesToDelete) {
        if (imageId) {
          try {
            await ctx.storage.delete(imageId);
          } catch (e) {
            console.error("Failed to delete orphaned method step image", {
              recipeId: args.recipeId,
              imageId,
              error: e,
            });
          }
        }
      }
    }

    await ctx.db.patch(args.recipeId, {
      title: args.title ?? recipe.title,
      description: args.description ?? recipe.description,
      prepTime: args.prepTime ?? recipe.prepTime,
      cookTime: args.cookTime ?? recipe.cookTime,
      serves: args.serves ?? recipe.serves,
      category: args.category ?? recipe.category,
      ingredients,
      method: args.method ?? recipe.method,
    });
  },
});

const _validateRecipe = (recipe: Doc<"recipes">) => {
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

  // cookTime is optional, but if provided must be >= 0
  if (
    recipe.cookTime !== undefined &&
    recipe.cookTime !== null &&
    recipe.cookTime < 0
  ) {
    errors.push({
      field: "cookTime",
      message: "Cook time must be 0 or greater",
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

  if (recipe.ingredients) {
    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ing = recipe.ingredients[i];
      if (!ing.name || ing.name.trim() === "") {
        errors.push({
          field: "ingredients",
          message: `Ingredient ${i + 1} must have a name`,
        });
      }
      if (!ing.amount || ing.amount <= 0) {
        errors.push({
          field: "ingredients",
          message: `Ingredient ${i + 1} must have a positive amount`,
        });
      }
    }
  }

  if (!recipe.method || recipe.method.length === 0) {
    errors.push({
      field: "method",
      message: "Must have at least 1 method step",
    });
  }

  if (recipe.method) {
    for (let i = 0; i < recipe.method.length; i++) {
      const step = recipe.method[i];
      if (!step.title || step.title.trim() === "") {
        errors.push({
          field: "method",
          message: `Method step ${i + 1} must have a title`,
        });
      }
    }
  }

  return errors;
};

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
      throw new ConvexError(
        "Unauthorised - only the recipe owner can publish it"
      );
    }

    const errors = _validateRecipe(recipe);

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
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError(
        "Unauthorised - only the recipe owner can delete it"
      );
    }

    // Delete any household shares of this recipe
    const householdShares = await ctx.db
      .query("householdRecipes")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    for (const share of householdShares) {
      await ctx.db.delete(share._id);
    }

    // Delete the recipe from the database
    await ctx.db.delete(args.recipeId);

    // Delete main recipe image
    if (recipe.image) {
      try {
        await ctx.storage.delete(recipe.image);
      } catch (e) {
        console.warn("Failed to delete recipe image", {
          recipeId: args.recipeId,
          imageId: recipe.image,
          error: e,
        });
      }
    }

    // Delete method step images
    if (recipe.method && recipe.method.length > 0) {
      for (const [index, step] of recipe.method.entries()) {
        if (step.image) {
          try {
            await ctx.storage.delete(step.image);
          } catch (e) {
            console.warn("Failed to delete method step image", {
              recipeId: args.recipeId,
              stepIndex: index,
              imageId: step.image,
              error: e,
            });
          }
        }
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
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }
    if (recipe.userId !== user._id) {
      throw new ConvexError("Unauthorised");
    }

    // Store the old image ID before updating
    const oldImageId = recipe.image;

    // Update recipe with new image
    await ctx.db.patch(args.recipeId, {
      image: args.storageId,
      updatedAt: Date.now(),
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
