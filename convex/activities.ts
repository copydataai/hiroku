import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    return await ctx.db
      .query("activities")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});

export const listRecent = query({
  args: {
    restaurantId: v.id("restaurants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    return await ctx.db
      .query("activities")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .take(args.limit ?? 10);
  },
});

export const create = mutation({
  args: {
    leadId: v.id("leads"),
    type: v.union(
      v.literal("note"),
      v.literal("call"),
      v.literal("email"),
      v.literal("stage_change"),
      v.literal("invoice_created"),
      v.literal("invoice_paid"),
      v.literal("task_created"),
      v.literal("task_completed"),
      v.literal("message_sent"),
      v.literal("message_received")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    const identity = await ctx.auth.getUserIdentity();

    return await ctx.db.insert("activities", {
      leadId: args.leadId,
      restaurantId: lead.restaurantId,
      type: args.type,
      title: args.title,
      description: args.description,
      metadata: args.metadata,
      createdBy: identity?.subject,
    });
  },
});
