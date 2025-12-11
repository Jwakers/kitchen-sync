"use client";

import { api } from "convex/_generated/api";
import { PLANS } from "convex/lib/constants";
import { useQuery } from "convex/react";

export default function useSubscription() {
  const user = useQuery(api.users.current);
  if (user === undefined) return undefined; // Still loading
  if (!user) return null; // No user found
  const planKey = user.subscriptionTier ?? "free_user";
  return PLANS[planKey];
}
