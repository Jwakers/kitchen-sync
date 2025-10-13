import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a user is the owner of a household
 */
export async function isHouseholdOwner(
  ctx: QueryCtx,
  userId: Id<"users">,
  householdId: Id<"households">
): Promise<boolean> {
  const membership = await ctx.db
    .query("householdMembers")
    .withIndex("by_user_and_household", (q) =>
      q.eq("userId", userId).eq("householdId", householdId)
    )
    .unique();

  return membership?.role === "owner";
}

/**
 * Check if a user is a member of a household (including owner)
 */
export async function isHouseholdMember(
  ctx: QueryCtx,
  userId: Id<"users">,
  householdId: Id<"households">
): Promise<boolean> {
  const membership = await ctx.db
    .query("householdMembers")
    .withIndex("by_user_and_household", (q) =>
      q.eq("userId", userId).eq("householdId", householdId)
    )
    .unique();

  return membership !== null;
}

/**
 * Check if a user can access a recipe (owns it or it's shared to their household)
 */
export async function canAccessRecipe(
  ctx: QueryCtx,
  userId: Id<"users">,
  recipeId: Id<"recipes">
): Promise<{ canAccess: boolean; isOwner: boolean }> {
  const recipe = await ctx.db.get(recipeId);
  if (!recipe) {
    return { canAccess: false, isOwner: false };
  }

  // Check if user owns the recipe
  if (recipe.userId === userId) {
    return { canAccess: true, isOwner: true };
  }

  // Check if recipe is shared to any of user's households
  const userMemberships = await ctx.db
    .query("householdMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const householdIds = userMemberships.map((m) => m.householdId);

  const sharedRecipes = await Promise.all(
    householdIds.map((householdId) =>
      ctx.db
        .query("householdRecipes")
        .withIndex("by_household_and_recipe", (q) =>
          q.eq("householdId", householdId).eq("recipeId", recipeId)
        )
        .unique()
    )
  );

  if (sharedRecipes.some((recipe) => recipe != null)) {
    return { canAccess: true, isOwner: false };
  }

  return { canAccess: false, isOwner: false };
}

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single household with its details
 */
export const getHousehold = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if user is a member
    const isMember = await isHouseholdMember(ctx, user._id, args.householdId);
    if (!isMember) {
      throw new ConvexError("You are not a member of this household");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new ConvexError("Household not found");
    }

    const isOwner = await isHouseholdOwner(ctx, user._id, args.householdId);

    return {
      ...household,
      isOwner,
    };
  },
});

/**
 * Get all households the current user belongs to
 */
export const getUserHouseholds = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const households = await Promise.all(
      memberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId);
        if (!household) return null;

        // Get member count
        const memberCount = await ctx.db
          .query("householdMembers")
          .withIndex("by_household", (q) =>
            q.eq("householdId", membership.householdId)
          )
          .collect();

        // Get recipe count
        const recipeCount = await ctx.db
          .query("householdRecipes")
          .withIndex("by_household", (q) =>
            q.eq("householdId", membership.householdId)
          )
          .collect();

        return {
          ...household,
          role: membership.role,
          memberCount: memberCount.length,
          recipeCount: recipeCount.length,
        };
      })
    );

    return households.filter((h) => h !== null);
  },
});

/**
 * Get all members of a household
 */
export const getHouseholdMembers = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if user is a member
    const isMember = await isHouseholdMember(ctx, user._id, args.householdId);
    if (!isMember) {
      throw new ConvexError("You are not a member of this household");
    }

    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        if (!memberUser) return null;

        return {
          _id: membership._id,
          userId: memberUser._id,
          name: memberUser.name,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return members.filter((m) => m !== null);
  },
});

/**
 * Get invitation details for display (public, used by invite page)
 */
export const getInvitationDetails = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) {
      return null;
    }

    // Check if expired
    if (invitation.expiresAt < Date.now()) {
      return {
        ...invitation,
        householdName: undefined,
        invitedByName: undefined,
        isExpired: true,
        isConsumed: false,
      };
    }

    // Check if already used (consumed)
    if (invitation.status === "accepted") {
      return {
        ...invitation,
        householdName: undefined,
        invitedByName: undefined,
        isExpired: false,
        isConsumed: true,
      };
    }

    const household = await ctx.db.get(invitation.householdId);
    const invitedBy = await ctx.db.get(invitation.invitedByUserId);

    return {
      ...invitation,
      householdName: household?.name ?? "Unknown Household",
      invitedByName: invitedBy?.name ?? "Unknown User",
      isExpired: false,
      isConsumed: false,
    };
  },
});

/**
 * Get all recipes shared to a household
 */
export const getHouseholdRecipes = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if user is a member
    const isMember = await isHouseholdMember(ctx, user._id, args.householdId);
    if (!isMember) {
      throw new ConvexError("You are not a member of this household");
    }

    const sharedRecipes = await ctx.db
      .query("householdRecipes")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const recipes = await Promise.all(
      sharedRecipes.map(async (shared) => {
        const recipe = await ctx.db.get(shared.recipeId);
        if (!recipe) return null;

        const sharedByUser = await ctx.db.get(shared.sharedByUserId);
        const owner = await ctx.db.get(recipe.userId);

        let image = null;
        if (recipe.image) {
          image = await ctx.storage.getUrl(recipe.image);
        }

        return {
          ...recipe,
          image,
          sharedBy: sharedByUser?.name ?? "Unknown User",
          sharedAt: shared.sharedAt,
          owner: owner?.name ?? "Unknown User",
          isOwner: recipe.userId === user._id,
        };
      })
    );

    return recipes.filter((r) => r !== null);
  },
});

export const getHouseholdsByRecipeId = query({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const { canAccess } = await canAccessRecipe(ctx, user._id, args.recipeId);

    if (!canAccess) {
      throw new ConvexError("You do not have access to this recipe");
    }

    const households = await ctx.db
      .query("householdRecipes")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    if (!households.length) {
      return null;
    }

    return households;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new household
 */
export const createHousehold = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (!args.name || args.name.trim().length === 0) {
      throw new ConvexError("Household name is required");
    }

    const now = Date.now();

    // Create the household
    const householdId = await ctx.db.insert("households", {
      name: args.name.trim(),
      ownerId: user._id,
      updatedAt: now,
    });

    // Add the creator as owner member
    await ctx.db.insert("householdMembers", {
      householdId,
      userId: user._id,
      role: "owner",
      joinedAt: now,
    });

    return { householdId };
  },
});

/**
 * Update household name (owner only)
 */
export const updateHousehold = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check ownership
    const isOwner = await isHouseholdOwner(ctx, user._id, args.householdId);
    if (!isOwner) {
      throw new ConvexError(
        "Only the household owner can update the household"
      );
    }

    if (!args.name || args.name.trim().length === 0) {
      throw new ConvexError("Household name is required");
    }

    await ctx.db.patch(args.householdId, {
      name: args.name.trim(),
      updatedAt: Date.now(),
    });

    export const deleteHousehold = mutation({
      args: {
        householdId: v.id("households"),
      },
      handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        // Check ownership
        const isOwner = await isHouseholdOwner(ctx, user._id, args.householdId);
        if (!isOwner) {
          throw new ConvexError(
            "Only the household owner can delete the household"
          );
        }

        // Delete all members
        const members = await ctx.db
          .query("householdMembers")
          .withIndex("by_household", (q) =>
            q.eq("householdId", args.householdId)
          )
          .collect();

        // Delete all invitations
        const invitations = await ctx.db
          .query("householdInvitations")
          .withIndex("by_household", (q) =>
            q.eq("householdId", args.householdId)
          )
          .collect();

        // Delete all shared recipes
        const sharedRecipes = await ctx.db
          .query("householdRecipes")
          .withIndex("by_household", (q) =>
            q.eq("householdId", args.householdId)
          )
          .collect();

        // Delete chalkboard items for this household
        const chalkboardItems = await ctx.db
          .query("chalkboardItems")
          .withIndex("by_household", (q) =>
            q.eq("householdId", args.householdId)
          )
          .collect();

        // Delete all related items
        const idsForDeletion = [
          ...members.map((member) => member._id),
          ...invitations.map((invitation) => invitation._id),
          ...sharedRecipes.map((sharedRecipe) => sharedRecipe._id),
          ...chalkboardItems.map((item) => item._id),
        ];

        await Promise.all(idsForDeletion.map((id) => ctx.db.delete(id)));

        // Finally, delete the household
        await ctx.db.delete(args.householdId);

        return { success: true };
      },
    });

    // Finally, delete the household
    await ctx.db.delete(args.householdId);

    return { success: true };
  },
});

/**
 * Create a single-use invitation link
 */
export const createInvitationLink = mutation({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check ownership
    const isOwner = await isHouseholdOwner(ctx, user._id, args.householdId);
    if (!isOwner) {
      throw new ConvexError("Only the household owner can create invitations");
    }

    const token = generateInvitationToken();
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const invitationId = await ctx.db.insert("householdInvitations", {
      householdId: args.householdId,
      invitedByUserId: user._id,
      status: "pending",
      token,
      expiresAt,
    });

    // Schedule to delete the invitation after it expires
    await ctx.scheduler.runAt(
      expiresAt,
      internal.households.deleteInvitationLink,
      {
        invitationId,
      }
    );

    return { invitationId, token };
  },
});

/**
 * Delete invitation link (internal)
 */
export const deleteInvitationLink = internalMutation({
  args: {
    invitationId: v.id("householdInvitations"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) return;

    await ctx.db.delete(args.invitationId);
  },
});

/**
 * Accept invitation by token (single-use)
 */
export const acceptInvitationByToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const invitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    // Check if already used (consumed) - single-use only
    if (invitation.status === "accepted") {
      throw new ConvexError(
        "This invitation has already been used. Each invitation link can only be used once."
      );
    }

    if (invitation.status === "expired") {
      throw new ConvexError("This invitation has expired");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new ConvexError("This invitation has expired");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user_and_household", (q) =>
        q.eq("userId", user._id).eq("householdId", invitation.householdId)
      )
      .unique();

    if (existingMembership) {
      // Already a member, just mark invitation as accepted
      await ctx.db.patch(invitation._id, {
        status: "accepted",
        invitedUserId: user._id,
      });
      return { householdId: invitation.householdId };
    }

    // Add user as member
    await ctx.db.insert("householdMembers", {
      householdId: invitation.householdId,
      userId: user._id,
      role: "member",
      joinedAt: Date.now(),
    });

    // Mark invitation as accepted and consumed
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      invitedUserId: user._id,
    });

    return { householdId: invitation.householdId };
  },
});

/**
 * Remove a member from household (owner only)
 */
export const removeMember = mutation({
  args: {
    householdId: v.id("households"),
    membershipId: v.id("householdMembers"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check ownership
    const isOwner = await isHouseholdOwner(ctx, user._id, args.householdId);
    if (!isOwner) {
      throw new ConvexError("Only the household owner can remove members");
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new ConvexError("Membership not found");
    }

    if (membership.householdId !== args.householdId) {
      throw new ConvexError("Membership does not belong to this household");
    }

    if (membership.role === "owner") {
      throw new ConvexError("Cannot remove the household owner");
    }

    await ctx.db.delete(args.membershipId);

    return { success: true };
  },
});

/**
 * Leave a household voluntarily
 */
export const leaveHousehold = mutation({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user_and_household", (q) =>
        q.eq("userId", user._id).eq("householdId", args.householdId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this household");
    }

    if (membership.role === "owner") {
      throw new ConvexError(
        "The household owner cannot leave. Delete the household instead."
      );
    }

    await ctx.db.delete(membership._id);

    return { success: true };
  },
});

/**
 * Share a recipe to a household
 */
export const shareRecipeToHousehold = mutation({
  args: {
    recipeId: v.id("recipes"),
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if user is a member of the household
    const isMember = await isHouseholdMember(ctx, user._id, args.householdId);
    if (!isMember) {
      throw new ConvexError("You are not a member of this household");
    }

    // Check if user owns the recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new ConvexError("Recipe not found");
    }

    if (recipe.userId !== user._id) {
      throw new ConvexError("You can only share your own recipes");
    }

    // Check if recipe is already shared
    const existingShare = await ctx.db
      .query("householdRecipes")
      .withIndex("by_household_and_recipe", (q) =>
        q.eq("householdId", args.householdId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (existingShare) {
      throw new ConvexError("Recipe is already shared to this household");
    }

    await ctx.db.insert("householdRecipes", {
      householdId: args.householdId,
      recipeId: args.recipeId,
      sharedByUserId: user._id,
      sharedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Unshare a recipe from a household
 */
export const unshareRecipeFromHousehold = mutation({
  args: {
    recipeId: v.id("recipes"),
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if recipe is shared
    const sharedRecipe = await ctx.db
      .query("householdRecipes")
      .withIndex("by_household_and_recipe", (q) =>
        q.eq("householdId", args.householdId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (!sharedRecipe) {
      throw new ConvexError("Recipe is not shared to this household");
    }

    // Only the person who shared it or the household owner can unshare
    const isOwner = await isHouseholdOwner(ctx, user._id, args.householdId);
    const isSharer = sharedRecipe.sharedByUserId === user._id;

    if (!isOwner && !isSharer) {
      throw new ConvexError(
        "Only the household owner or the person who shared the recipe can unshare it"
      );
    }

    await ctx.db.delete(sharedRecipe._id);

    return { success: true };
  },
});

// ============================================================================
// INTERNAL QUERIES (for HTTP endpoints)
// ============================================================================
