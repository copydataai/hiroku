import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const list = query({
  args: {
    restaurantId: v.id("restaurants"),
    channel: v.optional(
      v.union(v.literal("whatsapp"), v.literal("internal"))
    ),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    let conversations;
    if (args.channel) {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_restaurant_channel", (q) =>
          q
            .eq("restaurantId", args.restaurantId)
            .eq("channel", args.channel!)
        )
        .collect();
    } else {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId)
        )
        .collect();
    }

    // Attach lead info
    const results = [];
    for (const conv of conversations) {
      const lead = await ctx.db.get(conv.leadId);
      results.push({ ...conv, leadName: lead?.name ?? "Unknown" });
    }

    return results.sort(
      (a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)
    );
  },
});

export const getByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    return await ctx.db
      .query("conversations")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
  },
});

export const create = mutation({
  args: {
    leadId: v.id("leads"),
    channel: v.union(v.literal("whatsapp"), v.literal("internal")),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    return await ctx.db.insert("conversations", {
      leadId: args.leadId,
      restaurantId: lead.restaurantId,
      channel: args.channel,
      unreadCount: 0,
    });
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");
    await requireRestaurantAccess(ctx, conv.restaurantId);

    await ctx.db.patch(args.conversationId, { unreadCount: 0 });
  },
});
