import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

// Team membership is managed via Clerk Organizations + webhooks.
// This file only exposes read queries for the frontend.

export const list = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
  },
});
