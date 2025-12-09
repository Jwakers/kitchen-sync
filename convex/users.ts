import { UserJSON } from "@clerk/backend";
import { ConvexError, v, Validator } from "convex/values";
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { SUBSCRIPTION_TIERS } from "./lib/constants";

// Custom type based on actual Clerk webhook payload
// Clerk's TypeScript definitions don't match the actual webhook payload structure
export type ClerkSubscriptionItemWebhookData = {
  id: string;
  object: "subscription_item";
  status:
    | "upcoming"
    | "active"
    | "canceled"
    | "ended"
    | "past_due"
    | "incomplete"
    | "abandoned";
  interval: "month" | "annual";
  is_free_trial: boolean;
  subscription_id: string;
  plan_id: string;
  period_start: number;
  period_end: number;
  created_at: number;
  updated_at: number;
  payer: {
    id: string;
    object: "commerce_payer";
    user_id: string;
    organization_id: string;
    organization_name: string;
    email: string;
    first_name: string;
    last_name: string;
    image_url: string;
    created_at: number;
    updated_at: number;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    amount: number;
    currency: string;
    is_recurring: boolean;
  };
};

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      email: data.email_addresses[0]?.email_address ?? undefined,
      image: data.image_url ?? undefined,
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const updateSubscriptionTier = internalMutation({
  args: {
    data: v.any() as Validator<ClerkSubscriptionItemWebhookData>,
  },
  async handler(ctx, { data }) {
    console.log("Subscription webhook received:", {
      id: data.id,
      status: data.status,
      plan_id: data.plan_id,
      subscription_id: data.subscription_id,
      user_id: data.payer.user_id,
    });
    const userId = data.payer.user_id;

    const user = await userByExternalId(ctx, userId);
    if (user === null) {
      console.error(`User not found for Clerk user ID: ${userId}`);
      throw new ConvexError(`User not found for Clerk user ID: ${userId}`);
    }

    let subscriptionTier: (typeof SUBSCRIPTION_TIERS)[number] | undefined =
      user.subscriptionTier;

    if (
      !SUBSCRIPTION_TIERS.includes(
        data.plan.slug as (typeof SUBSCRIPTION_TIERS)[number]
      )
    ) {
      throw new ConvexError(`Invalid subscription tier: ${data.plan.slug}.`);
    }

    subscriptionTier = data.plan.slug as (typeof SUBSCRIPTION_TIERS)[number];

    console.log(
      `Updating user ${user._id} to ${subscriptionTier} tier (status: ${data.status}, subscription: ${data.subscription_id})`
    );

    // Update user with subscription details for failsafe tracking
    await ctx.db.patch(user._id, {
      subscriptionTier,
      subscriptionStatus: data.status,
      subscriptionId: data.subscription_id,
      lastSubscriptionSync: Date.now(),
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new ConvexError("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}
