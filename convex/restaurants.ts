import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, requireRestaurantAccess } from "./lib/permissions";

const DEFAULT_PIPELINE_STAGES = [
  { id: "new", name: "New", color: "#6366f1", order: 0 },
  { id: "contacted", name: "Contacted", color: "#f59e0b", order: 1 },
  { id: "qualified", name: "Qualified", color: "#3b82f6", order: 2 },
  { id: "proposal", name: "Proposal", color: "#8b5cf6", order: 3 },
  { id: "negotiation", name: "Negotiation", color: "#ec4899", order: 4 },
  { id: "won", name: "Won", color: "#10b981", order: 5 },
  { id: "lost", name: "Lost", color: "#ef4444", order: 6 },
];

/**
 * Called from the onboarding form after the Clerk organization is created.
 * Creates the restaurant record and the owner teamMember.
 * Idempotent — if the webhook already created the restaurant, this patches it.
 */
export const setupFromOrg = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Check slug uniqueness
    const slugTaken = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (slugTaken && slugTaken.clerkOrgId !== args.clerkOrgId) {
      throw new Error("Restaurant slug already taken");
    }

    // Idempotent: check if restaurant already exists (webhook may have created it)
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    let restaurantId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
        currency: args.currency ?? "USD",
      });
      restaurantId = existing._id;
    } else {
      restaurantId = await ctx.db.insert("restaurants", {
        clerkOrgId: args.clerkOrgId,
        slug: args.slug,
        name: args.name,
        currency: args.currency ?? "USD",
        defaultTaxRate: 0,
        pipelineStages: DEFAULT_PIPELINE_STAGES,
      });
    }

    // Ensure the creator is a teamMember with owner role
    const existingMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_clerk_org_and_user", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", userId)
      )
      .first();

    if (!existingMember) {
      const identity = await ctx.auth.getUserIdentity();
      await ctx.db.insert("teamMembers", {
        restaurantId,
        clerkOrgId: args.clerkOrgId,
        clerkUserId: userId,
        role: "owner",
        name: identity?.name ?? "",
        email: identity?.email ?? "",
      });
    }

    return restaurantId;
  },
});

/**
 * Get the restaurant for the current user's active organization.
 */
export const get = query({
  args: { restaurantId: v.optional(v.id("restaurants")) },
  handler: async (ctx, args) => {
    if (args.restaurantId) {
      return await ctx.db.get(args.restaurantId);
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const orgId = (identity as any).org_id;
    if (!orgId) return null;

    return await ctx.db
      .query("restaurants")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .first();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const update = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    currency: v.optional(v.string()),
    defaultTaxRate: v.optional(v.number()),
    whatsappPhoneNumberId: v.optional(v.string()),
    whatsappAccessToken: v.optional(v.string()),
    whatsappVerifyToken: v.optional(v.string()),
    pipelineStages: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          color: v.string(),
          order: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { restaurantId, ...updates } = args;
    await requireRestaurantAccess(ctx, restaurantId);

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    await ctx.db.patch(restaurantId, patch);
  },
});

export const getDashboardStats = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    const recentActivities = await ctx.db
      .query("activities")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .take(10);

    return {
      totalLeads: leads.length,
      leadsByStage: leads.reduce(
        (acc, l) => {
          acc[l.pipelineStage] = (acc[l.pipelineStage] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      activeConversations: conversations.filter((c) => c.unreadCount > 0)
        .length,
      totalUnreadMessages: conversations.reduce(
        (sum, c) => sum + c.unreadCount,
        0
      ),
      pendingInvoices: invoices.filter(
        (i) => i.status === "sent" || i.status === "overdue"
      ).length,
      invoiceTotal: invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.total, 0),
      openTasks: tasks.filter(
        (t) => t.status === "pending" || t.status === "in_progress"
      ).length,
      overdueTasks: tasks.filter(
        (t) => t.status === "pending" && t.dueAt && t.dueAt < Date.now()
      ).length,
      recentActivities,
    };
  },
});
