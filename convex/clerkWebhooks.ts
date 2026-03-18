import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const DEFAULT_PIPELINE_STAGES = [
  { id: "new", name: "New", color: "#6366f1", order: 0 },
  { id: "contacted", name: "Contacted", color: "#f59e0b", order: 1 },
  { id: "qualified", name: "Qualified", color: "#3b82f6", order: 2 },
  { id: "proposal", name: "Proposal", color: "#8b5cf6", order: 3 },
  { id: "negotiation", name: "Negotiation", color: "#ec4899", order: 4 },
  { id: "won", name: "Won", color: "#10b981", order: 5 },
  { id: "lost", name: "Lost", color: "#ef4444", order: 6 },
];

export const createRestaurantFromOrg = internalMutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotent — skip if already exists
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("restaurants", {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
      currency: "USD",
      defaultTaxRate: 0,
      pipelineStages: DEFAULT_PIPELINE_STAGES,
    });
  },
});

export const updateRestaurantFromOrg = internalMutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
    if (!restaurant) return;

    await ctx.db.patch(restaurant._id, { name: args.name });
  },
});

export const deleteRestaurantFromOrg = internalMutation({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
    if (!restaurant) return;

    // Remove all team members for this org
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(restaurant._id);
  },
});

export const addMemberFromOrg = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
    if (!restaurant) return;

    // Idempotent — skip if already exists
    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_clerk_org_and_user", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId)
      )
      .first();
    if (existing) return existing._id;

    // Map Clerk org roles to app roles
    const role = mapClerkRole(args.role);

    return await ctx.db.insert("teamMembers", {
      restaurantId: restaurant._id,
      clerkOrgId: args.clerkOrgId,
      clerkUserId: args.clerkUserId,
      role,
      name: args.name,
      email: args.email,
    });
  },
});

export const updateMemberFromOrg = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_clerk_org_and_user", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId)
      )
      .first();
    if (!member) return;

    const patch: Record<string, unknown> = { role: mapClerkRole(args.role) };
    if (args.name) patch.name = args.name;
    if (args.email) patch.email = args.email;

    await ctx.db.patch(member._id, patch);
  },
});

export const removeMemberFromOrg = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_clerk_org_and_user", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId)
      )
      .first();
    if (!member) return;

    // Unassign any leads/tasks assigned to this member
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", member._id))
      .collect();
    for (const lead of leads) {
      await ctx.db.patch(lead._id, { assignedTo: undefined });
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", member._id))
      .collect();
    for (const task of tasks) {
      await ctx.db.patch(task._id, { assignedTo: undefined });
    }

    await ctx.db.delete(member._id);
  },
});

// ── User sync ───────────────────────────────────────────

export const upsertUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", args);
  },
});

export const deleteUser = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    if (!user) return;

    await ctx.db.delete(user._id);
  },
});

function mapClerkRole(
  clerkRole: string
): "owner" | "admin" | "manager" | "staff" {
  switch (clerkRole) {
    case "org:admin":
      return "admin";
    case "org:manager":
      return "manager";
    case "org:member":
      return "staff";
    default:
      return "staff";
  }
}
