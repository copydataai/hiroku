import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const placeOrder = mutation({
  args: {
    restaurantSlug: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find restaurant by slug
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.restaurantSlug))
      .first();
    if (!restaurant) throw new Error("Restaurant not found");

    // Find or create lead by phone
    let lead = await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .filter((q) => q.eq(q.field("phone"), args.customerPhone))
      .first();

    if (!lead) {
      const leadId = await ctx.db.insert("leads", {
        restaurantId: restaurant._id,
        name: args.customerName,
        phone: args.customerPhone,
        whatsappPhoneNumber: args.customerPhone,
        source: "walk_in",
        pipelineStage: "new",
        score: 0,
        priority: "medium",
      });
      lead = (await ctx.db.get(leadId))!;
    }

    // Calculate totals
    const subtotal = args.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxRate = restaurant.defaultTaxRate ?? 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceCount = await ctx.db
      .query("invoices")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .collect();
    const invoiceNumber = `INV-${String(invoiceCount.length + 1).padStart(4, "0")}`;

    // Create invoice
    const invoiceId = await ctx.db.insert("invoices", {
      restaurantId: restaurant._id,
      leadId: lead._id,
      invoiceNumber,
      status: "sent",
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: 0,
      total,
      notes: args.notes,
      sentAt: Date.now(),
    });

    // Create invoice items
    for (const item of args.items) {
      await ctx.db.insert("invoiceItems", {
        invoiceId,
        restaurantId: restaurant._id,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      });
    }

    // Create docket for kitchen
    const docketCount = await ctx.db
      .query("dockets")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .collect();
    const docketNumber = `DKT-${String(docketCount.length + 1).padStart(4, "0")}`;

    await ctx.db.insert("dockets", {
      restaurantId: restaurant._id,
      invoiceId,
      leadId: lead._id,
      type: "order_docket",
      docketNumber,
      items: args.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      status: "pending",
      printCount: 0,
      notes: args.notes,
    });

    // Log activity
    await ctx.db.insert("activities", {
      leadId: lead._id,
      restaurantId: restaurant._id,
      type: "invoice_created",
      title: `Online order ${invoiceNumber}`,
      description: `${args.items.length} items, total ${restaurant.currency} ${total.toFixed(2)}`,
      metadata: { invoiceId, source: "online_menu" },
    });

    return { invoiceNumber, total };
  },
});
