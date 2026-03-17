import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const list = query({
  args: {
    restaurantId: v.id("restaurants"),
    stage: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("whatsapp"),
        v.literal("walk_in"),
        v.literal("manual"),
        v.literal("referral")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    let results = await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    if (args.stage) results = results.filter((l) => l.pipelineStage === args.stage);
    if (args.source) results = results.filter((l) => l.source === args.source);
    if (args.priority) results = results.filter((l) => l.priority === args.priority);

    return results.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const get = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);
    return lead;
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    source: v.union(
      v.literal("whatsapp"),
      v.literal("walk_in"),
      v.literal("manual"),
      v.literal("referral")
    ),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const leadId = await ctx.db.insert("leads", {
      restaurantId: args.restaurantId,
      name: args.name,
      phone: args.phone,
      email: args.email,
      source: args.source,
      pipelineStage: "new",
      score: 0,
      priority: args.priority ?? "medium",
      notes: args.notes,
    });

    await ctx.db.insert("activities", {
      leadId,
      restaurantId: args.restaurantId,
      type: "note",
      title: `Lead created (${args.source})`,
    });

    return leadId;
  },
});

export const update = mutation({
  args: {
    leadId: v.id("leads"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    score: v.optional(v.number()),
    assignedTo: v.optional(v.id("teamMembers")),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    const { leadId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(leadId, patch);
  },
});

export const updateStage = mutation({
  args: {
    leadId: v.id("leads"),
    pipelineStage: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    const oldStage = lead.pipelineStage;
    await ctx.db.patch(args.leadId, { pipelineStage: args.pipelineStage });

    await ctx.db.insert("activities", {
      leadId: args.leadId,
      restaurantId: lead.restaurantId,
      type: "stage_change",
      title: `Stage changed from "${oldStage}" to "${args.pipelineStage}"`,
      metadata: { from: oldStage, to: args.pipelineStage },
    });
  },
});

export const getRecent = query({
  args: {
    restaurantId: v.id("restaurants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    return await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .take(args.limit ?? 5);
  },
});
