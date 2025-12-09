import type { WebhookEvent } from "@clerk/backend";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import type { ClerkSubscriptionItemWebhookData } from "./users";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    try {
      switch (event.type) {
        case "user.created": // intentional fallthrough
        case "user.updated":
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });
          break;

        case "user.deleted": {
          const clerkUserId = event.data.id;
          if (!clerkUserId) {
            console.error("user.deleted event missing id");
            return new Response("Invalid event data", { status: 400 });
          }
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId,
          });
          break;
        }
        case "subscriptionItem.created":
        case "subscriptionItem.updated":
        case "subscriptionItem.active":
        case "subscriptionItem.canceled": {
          // NOTE: Using custom type because Clerk's billing feature is in beta and their
          // TypeScript definitions don't match the actual webhook payload structure.
          // The official types expect fields like 'credit', 'proration_date', 'next_payment_amount'
          // but the actual payload has 'payer' (object), 'subscription_id', 'interval', etc.
          // TODO: Once Clerk's billing feature exits beta, revisit this and use their built-in
          // types (assuming they're corrected) instead of the custom ClerkSubscriptionItemWebhookData.
          // Double cast (as unknown as ...) is necessary because the types are too different.

          // FAILSAFE: If this mutation fails, Clerk/Svix will retry the webhook automatically.
          // Additionally, our daily cron job (syncStaleSubscriptions) will catch any missed updates.
          await ctx.runMutation(internal.users.updateSubscriptionTier, {
            data: event.data as unknown as ClerkSubscriptionItemWebhookData,
          });
          break;
        }
        default:
          console.log("Ignored Clerk webhook event", event.type);
      }

      // Return 200 to acknowledge successful processing
      // This tells Clerk/Svix not to retry this webhook
      return new Response(null, { status: 200 });
    } catch (error) {
      // Log the error for debugging
      console.error(`Failed to process webhook ${event.type}:`, error);

      // Return 500 to trigger Clerk/Svix automatic retry
      // They will retry with exponential backoff
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required Svix headers");
    return null;
  }

  const svixHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
