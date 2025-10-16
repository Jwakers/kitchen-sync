import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Clean up expired shopping lists daily at 2 AM UTC
 * This removes shopping lists that have exceeded their expiry time (1 week)
 */
crons.daily(
  "cleanup-expired-shopping-lists",
  { hourUTC: 2, minuteUTC: 0 },
  internal.shoppingLists.cleanupExpired
);

export default crons;
