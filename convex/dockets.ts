import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const list = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("printed"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    if (args.status) {
      return await ctx.db
        .query("dockets")
        .withIndex("by_restaurant_status", (q) =>
          q
            .eq("restaurantId", args.restaurantId)
            .eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("dockets")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    invoiceId: v.optional(v.id("invoices")),
    leadId: v.optional(v.id("leads")),
    type: v.union(
      v.literal("order_docket"),
      v.literal("menu_print"),
      v.literal("receipt")
    ),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    tableNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const existing = await ctx.db
      .query("dockets")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
    const docketNumber = `DOC-${String(existing.length + 1).padStart(4, "0")}`;

    return await ctx.db.insert("dockets", {
      restaurantId: args.restaurantId,
      invoiceId: args.invoiceId,
      leadId: args.leadId,
      type: args.type,
      docketNumber,
      items: args.items,
      tableNumber: args.tableNumber,
      status: "pending",
      printCount: 0,
      notes: args.notes,
    });
  },
});

export const markPrinted = mutation({
  args: { docketId: v.id("dockets") },
  handler: async (ctx, args) => {
    const docket = await ctx.db.get(args.docketId);
    if (!docket) throw new Error("Docket not found");
    await requireRestaurantAccess(ctx, docket.restaurantId);

    await ctx.db.patch(args.docketId, {
      status: "printed",
      printCount: docket.printCount + 1,
    });
  },
});

export const markCompleted = mutation({
  args: { docketId: v.id("dockets") },
  handler: async (ctx, args) => {
    const docket = await ctx.db.get(args.docketId);
    if (!docket) throw new Error("Docket not found");
    await requireRestaurantAccess(ctx, docket.restaurantId);

    await ctx.db.patch(args.docketId, { status: "completed" });
  },
});
