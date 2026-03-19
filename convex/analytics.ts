import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

// Revenue per day for last 30 days
export const revenueOverTime = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const paidInvoices = invoices.filter(
      (i) => i.status === "paid" && i.paidAt && i.paidAt >= thirtyDaysAgo
    );

    // Pre-fill 30 days of zero values
    const byDate: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      byDate[key] = 0;
    }

    for (const inv of paidInvoices) {
      const key = new Date(inv.paidAt!).toISOString().split("T")[0];
      if (byDate[key] !== undefined) {
        byDate[key] += inv.total;
      }
    }

    return Object.entries(byDate).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));
  },
});

// Lead conversion funnel — counts per pipeline stage
export const conversionFunnel = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) return [];

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const stages = restaurant.pipelineStages ?? [];
    return stages
      .sort((a: any, b: any) => a.order - b.order)
      .map((stage: any) => ({
        stage: stage.name,
        count: leads.filter((l) => l.pipelineStage === stage.id).length,
        color: stage.color,
      }));
  },
});

// Top 10 menu items by order volume
export const popularItems = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const items = await ctx.db
      .query("invoiceItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const counts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const item of items) {
      const key = item.name;
      if (!counts[key]) {
        counts[key] = { name: key, quantity: 0, revenue: 0 };
      }
      counts[key].quantity += item.quantity;
      counts[key].revenue += item.totalPrice;
    }

    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  },
});

// Lead source distribution
export const sourceDistribution = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    const sources: Record<string, number> = {};
    for (const lead of leads) {
      sources[lead.source] = (sources[lead.source] || 0) + 1;
    }

    const colors: Record<string, string> = {
      whatsapp: "#25d366",
      walk_in: "#6366f1",
      manual: "#c8963e",
      referral: "#ec4899",
    };

    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      color: colors[source] || "#94a3b8",
    }));
  },
});
