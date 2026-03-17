import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess, requireRole } from "./lib/permissions";

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

export const add = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    clerkUserId: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff")),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { member } = await requireRestaurantAccess(ctx, args.restaurantId);
    requireRole(member.role, ["owner", "admin"]);

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_restaurant_and_user", (q) =>
        q
          .eq("restaurantId", args.restaurantId)
          .eq("clerkUserId", args.clerkUserId)
      )
      .first();
    if (existing) throw new Error("User is already a team member");

    return await ctx.db.insert("teamMembers", {
      restaurantId: args.restaurantId,
      clerkUserId: args.clerkUserId,
      role: args.role,
      name: args.name,
      email: args.email,
    });
  },
});

export const updateRole = mutation({
  args: {
    memberId: v.id("teamMembers"),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff")),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.memberId);
    if (!target) throw new Error("Member not found");

    const { member } = await requireRestaurantAccess(ctx, target.restaurantId);
    requireRole(member.role, ["owner", "admin"]);

    if (target.role === "owner") throw new Error("Cannot change owner role");

    await ctx.db.patch(args.memberId, { role: args.role });
  },
});

export const remove = mutation({
  args: { memberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.memberId);
    if (!target) throw new Error("Member not found");

    const { member } = await requireRestaurantAccess(ctx, target.restaurantId);
    requireRole(member.role, ["owner", "admin"]);

    if (target.role === "owner") throw new Error("Cannot remove owner");

    await ctx.db.delete(args.memberId);
  },
});
