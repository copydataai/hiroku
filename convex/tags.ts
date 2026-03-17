import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const list = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    return await ctx.db
      .query("tags")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    return await ctx.db.insert("tags", {
      restaurantId: args.restaurantId,
      name: args.name,
      color: args.color,
    });
  },
});

export const remove = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.tagId);
    if (!tag) throw new Error("Tag not found");
    await requireRestaurantAccess(ctx, tag.restaurantId);

    // Remove all lead-tag associations
    const associations = await ctx.db
      .query("leadTags")
      .withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
      .collect();
    for (const assoc of associations) await ctx.db.delete(assoc._id);

    await ctx.db.delete(args.tagId);
  },
});

export const getLeadTags = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    const associations = await ctx.db
      .query("leadTags")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();

    const tags = [];
    for (const assoc of associations) {
      const tag = await ctx.db.get(assoc.tagId);
      if (tag) tags.push(tag);
    }
    return tags;
  },
});

export const addToLead = mutation({
  args: { leadId: v.id("leads"), tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    const existing = await ctx.db
      .query("leadTags")
      .withIndex("by_lead_tag", (q) =>
        q.eq("leadId", args.leadId).eq("tagId", args.tagId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("leadTags", {
      leadId: args.leadId,
      tagId: args.tagId,
      restaurantId: lead.restaurantId,
    });
  },
});

export const removeFromLead = mutation({
  args: { leadId: v.id("leads"), tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const assoc = await ctx.db
      .query("leadTags")
      .withIndex("by_lead_tag", (q) =>
        q.eq("leadId", args.leadId).eq("tagId", args.tagId)
      )
      .first();
    if (assoc) {
      await requireRestaurantAccess(ctx, assoc.restaurantId);
      await ctx.db.delete(assoc._id);
    }
  },
});
