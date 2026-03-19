import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

// ── Internal Queries for AI Chatbot Context ───────────────

export const getRestaurantContext = internalQuery({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.restaurantId);
  },
});

export const getConversationHistory = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(20);
    return messages.reverse();
  },
});

export const getMenuContext = internalQuery({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const menus = await ctx.db
      .query("menus")
      .withIndex("by_restaurant_active", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("isActive", true)
      )
      .collect();

    const result = [];
    for (const menu of menus) {
      const categories = await ctx.db
        .query("menuCategories")
        .withIndex("by_menu", (q) => q.eq("menuId", menu._id))
        .collect();

      const catsWithItems = [];
      for (const cat of categories) {
        const items = await ctx.db
          .query("menuItems")
          .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
          .collect();
        catsWithItems.push({
          name: cat.name,
          items: items
            .filter((i) => i.isAvailable)
            .map((i) => ({
              name: i.name,
              description: i.description,
              price: i.price,
              tags: i.tags,
            })),
        });
      }
      result.push({ name: menu.name, categories: catsWithItems });
    }
    return { menus: result };
  },
});

export const searchMenuItems = internalQuery({
  args: {
    restaurantId: v.id("restaurants"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("menuItems")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.query).eq("restaurantId", args.restaurantId)
      )
      .take(10);
    return results
      .filter((i) => i.isAvailable)
      .map((i) => ({
        name: i.name,
        description: i.description,
        price: i.price,
        tags: i.tags,
      }));
  },
});

// ── Internal Mutations ─────────────────────────────────────

export const createOrderFromChat = internalMutation({
  args: {
    restaurantId: v.id("restaurants"),
    leadId: v.id("leads"),
    items: v.array(
      v.object({
        menuItemId: v.optional(v.id("menuItems")),
        name: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get restaurant for tax rate
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    // Generate invoice number (INV-XXXXX format)
    const invoiceCount = (
      await ctx.db
        .query("invoices")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId)
        )
        .collect()
    ).length;
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, "0")}`;

    // Calculate totals
    const subtotal = args.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxRate = restaurant.defaultTaxRate ?? 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Create invoice
    const invoiceId = await ctx.db.insert("invoices", {
      restaurantId: args.restaurantId,
      leadId: args.leadId,
      invoiceNumber,
      status: "sent",
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: 0,
      total,
      notes: args.notes,
    });

    // Create invoice items
    for (const item of args.items) {
      await ctx.db.insert("invoiceItems", {
        invoiceId,
        restaurantId: args.restaurantId,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      });
    }

    // Generate docket
    const docketCount = (
      await ctx.db
        .query("dockets")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId)
        )
        .collect()
    ).length;
    const docketNumber = `DKT-${String(docketCount + 1).padStart(5, "0")}`;

    await ctx.db.insert("dockets", {
      restaurantId: args.restaurantId,
      invoiceId,
      leadId: args.leadId,
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
      leadId: args.leadId,
      restaurantId: args.restaurantId,
      type: "note",
      title: `Order placed via WhatsApp`,
      description: `${invoiceNumber} — ${args.items.length} item(s), total: ${total.toFixed(2)}`,
      metadata: { invoiceId, source: "whatsapp_chatbot" },
    });

    return { invoiceNumber, docketNumber, total, subtotal, taxAmount };
  },
});

export const updateLeadStage = internalMutation({
  args: {
    leadId: v.id("leads"),
    restaurantId: v.id("restaurants"),
    stage: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return;

    const oldStage = lead.pipelineStage;
    await ctx.db.patch(args.leadId, { pipelineStage: args.stage });

    // Log activity
    await ctx.db.insert("activities", {
      leadId: args.leadId,
      restaurantId: args.restaurantId,
      type: "stage_change",
      title: `Stage: ${oldStage} → ${args.stage}`,
      description: `AI: ${args.reason}`,
      metadata: { from: oldStage, to: args.stage, source: "ai_chatbot" },
    });
  },
});
