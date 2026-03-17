import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const listByInvoice = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    await requireRestaurantAccess(ctx, invoice.restaurantId);

    return await ctx.db
      .query("invoiceItems")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.invoiceId))
      .collect();
  },
});

export const add = mutation({
  args: {
    invoiceId: v.id("invoices"),
    menuItemId: v.optional(v.id("menuItems")),
    name: v.string(),
    description: v.optional(v.string()),
    quantity: v.number(),
    unitPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    await requireRestaurantAccess(ctx, invoice.restaurantId);

    const totalPrice = args.quantity * args.unitPrice;

    const itemId = await ctx.db.insert("invoiceItems", {
      invoiceId: args.invoiceId,
      restaurantId: invoice.restaurantId,
      menuItemId: args.menuItemId,
      name: args.name,
      description: args.description,
      quantity: args.quantity,
      unitPrice: args.unitPrice,
      totalPrice,
    });

    // Recalculate invoice totals
    await recalculateInvoice(ctx, args.invoiceId);

    return itemId;
  },
});

export const update = mutation({
  args: {
    itemId: v.id("invoiceItems"),
    quantity: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await requireRestaurantAccess(ctx, item.restaurantId);

    const qty = args.quantity ?? item.quantity;
    const price = args.unitPrice ?? item.unitPrice;

    const patch: Record<string, unknown> = { totalPrice: qty * price };
    if (args.quantity !== undefined) patch.quantity = args.quantity;
    if (args.unitPrice !== undefined) patch.unitPrice = args.unitPrice;
    if (args.name !== undefined) patch.name = args.name;

    await ctx.db.patch(args.itemId, patch);
    await recalculateInvoice(ctx, item.invoiceId);
  },
});

export const remove = mutation({
  args: { itemId: v.id("invoiceItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await requireRestaurantAccess(ctx, item.restaurantId);

    const invoiceId = item.invoiceId;
    await ctx.db.delete(args.itemId);
    await recalculateInvoice(ctx, invoiceId);
  },
});

async function recalculateInvoice(
  ctx: { db: any },
  invoiceId: any
) {
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) return;

  const items = await ctx.db
    .query("invoiceItems")
    .withIndex("by_invoice", (q: any) => q.eq("invoiceId", invoiceId))
    .collect();

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.totalPrice,
    0
  );
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const total = subtotal + taxAmount - invoice.discountAmount;

  await ctx.db.patch(invoiceId, { subtotal, taxAmount, total });
}
