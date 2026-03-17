import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const list = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_restaurant_status", (q) =>
          q.eq("restaurantId", args.restaurantId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .collect();
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    return await ctx.db
      .query("tasks")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    leadId: v.optional(v.id("leads")),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assignedTo: v.optional(v.id("teamMembers")),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const taskId = await ctx.db.insert("tasks", {
      restaurantId: args.restaurantId,
      leadId: args.leadId,
      title: args.title,
      description: args.description,
      status: "pending",
      priority: args.priority ?? "medium",
      assignedTo: args.assignedTo,
      dueAt: args.dueAt,
    });

    if (args.leadId) {
      await ctx.db.insert("activities", {
        leadId: args.leadId,
        restaurantId: args.restaurantId,
        type: "task_created",
        title: `Task created: ${args.title}`,
      });
    }

    return taskId;
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
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
    assignedTo: v.optional(v.id("teamMembers")),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    await requireRestaurantAccess(ctx, task.restaurantId);

    const { taskId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }

    if (updates.status === "completed" && task.status !== "completed") {
      patch.completedAt = Date.now();

      if (task.leadId) {
        await ctx.db.insert("activities", {
          leadId: task.leadId,
          restaurantId: task.restaurantId,
          type: "task_completed",
          title: `Task completed: ${task.title}`,
        });
      }
    }

    await ctx.db.patch(taskId, patch);
  },
});
