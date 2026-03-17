import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const list = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled"),
        v.literal("refunded")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);

    if (args.status) {
      return await ctx.db
        .query("invoices")
        .withIndex("by_restaurant_status", (q) =>
          q
            .eq("restaurantId", args.restaurantId)
            .eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("invoices")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    await requireRestaurantAccess(ctx, invoice.restaurantId);

    const lead = await ctx.db.get(invoice.leadId);
    return { ...invoice, leadName: lead?.name ?? "Unknown" };
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await requireRestaurantAccess(ctx, lead.restaurantId);

    return await ctx.db
      .query("invoices")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    leadId: v.id("leads"),
    items: v.array(
      v.object({
        menuItemId: v.optional(v.id("menuItems")),
        name: v.string(),
        description: v.optional(v.string()),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    taxRate: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { restaurant } = await requireRestaurantAccess(
      ctx,
      args.restaurantId
    );

    // Generate invoice number
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
    const invoiceNumber = `INV-${String(existing.length + 1).padStart(4, "0")}`;

    const taxRate = args.taxRate ?? restaurant.defaultTaxRate;
    const discount = args.discountAmount ?? 0;

    const subtotal = args.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;

    const invoiceId = await ctx.db.insert("invoices", {
      restaurantId: args.restaurantId,
      leadId: args.leadId,
      invoiceNumber,
      status: "draft",
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: discount,
      total,
      notes: args.notes,
      dueAt: args.dueAt,
    });

    // Insert line items
    for (const item of args.items) {
      await ctx.db.insert("invoiceItems", {
        invoiceId,
        restaurantId: args.restaurantId,
        menuItemId: item.menuItemId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      });
    }

    // Activity log
    await ctx.db.insert("activities", {
      leadId: args.leadId,
      restaurantId: args.restaurantId,
      type: "invoice_created",
      title: `Invoice ${invoiceNumber} created ($${total.toFixed(2)})`,
      metadata: { invoiceId, invoiceNumber, total },
    });

    return invoiceId;
  },
});

export const updateStatus = mutation({
  args: {
    invoiceId: v.id("invoices"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("card"),
        v.literal("transfer"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    await requireRestaurantAccess(ctx, invoice.restaurantId);

    const patch: Record<string, unknown> = { status: args.status };

    if (args.status === "paid") {
      patch.paidAt = Date.now();
      if (args.paymentMethod) patch.paymentMethod = args.paymentMethod;

      await ctx.db.insert("activities", {
        leadId: invoice.leadId,
        restaurantId: invoice.restaurantId,
        type: "invoice_paid",
        title: `Invoice ${invoice.invoiceNumber} paid ($${invoice.total.toFixed(2)})`,
        metadata: {
          invoiceId: args.invoiceId,
          paymentMethod: args.paymentMethod,
        },
      });
    }

    if (args.status === "sent") {
      patch.sentAt = Date.now();
    }

    await ctx.db.patch(args.invoiceId, patch);
  },
});
