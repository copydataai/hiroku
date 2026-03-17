import { v } from "convex/values";
import { internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";

// Called by the HTTP webhook handler to process incoming WhatsApp messages
export const processIncomingMessage = internalMutation({
  args: {
    restaurantId: v.id("restaurants"),
    from: v.string(),
    whatsappMessageId: v.string(),
    messageType: v.string(),
    content: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Find or create lead by phone number
    let lead = await ctx.db
      .query("leads")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .filter((q) => q.eq(q.field("whatsappPhoneNumber"), args.from))
      .first();

    if (!lead) {
      const leadId = await ctx.db.insert("leads", {
        restaurantId: args.restaurantId,
        name: args.from,
        phone: args.from,
        whatsappPhoneNumber: args.from,
        source: "whatsapp",
        pipelineStage: "new",
        score: 0,
        priority: "medium",
        lastMessageAt: args.timestamp,
      });
      lead = (await ctx.db.get(leadId))!;
    } else {
      await ctx.db.patch(lead._id, { lastMessageAt: args.timestamp });
    }

    // Find or create conversation
    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_lead", (q) => q.eq("leadId", lead!._id))
      .filter((q) => q.eq(q.field("channel"), "whatsapp"))
      .first();

    if (!conversation) {
      const convId = await ctx.db.insert("conversations", {
        leadId: lead._id,
        restaurantId: args.restaurantId,
        channel: "whatsapp",
        unreadCount: 1,
        lastMessagePreview: args.content?.substring(0, 100),
        lastMessageAt: args.timestamp,
      });
      conversation = (await ctx.db.get(convId))!;
    } else {
      await ctx.db.patch(conversation._id, {
        unreadCount: conversation.unreadCount + 1,
        lastMessagePreview: args.content?.substring(0, 100),
        lastMessageAt: args.timestamp,
      });
    }

    // Create message
    await ctx.db.insert("messages", {
      conversationId: conversation._id,
      restaurantId: args.restaurantId,
      direction: "inbound",
      senderType: "customer",
      messageType: (args.messageType as "text" | "image" | "document" | "audio" | "video" | "location" | "template") || "text",
      content: args.content,
      whatsappMessageId: args.whatsappMessageId,
      whatsappStatus: "delivered",
    });

    return { leadId: lead._id, conversationId: conversation._id };
  },
});

// Send a WhatsApp message via the Business API
export const sendWhatsAppMessage = action({
  args: {
    restaurantId: v.id("restaurants"),
    to: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get restaurant's WhatsApp config
    const restaurant: any = await ctx.runQuery(
      internal.whatsapp.getRestaurantConfig,
      { restaurantId: args.restaurantId }
    );

    if (!restaurant?.whatsappPhoneNumberId || !restaurant?.whatsappAccessToken) {
      throw new Error("WhatsApp not configured for this restaurant");
    }

    const response: Response = await fetch(
      `https://graph.facebook.com/v18.0/${restaurant.whatsappPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${restaurant.whatsappAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: args.to,
          type: "text",
          text: { body: args.message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WhatsApp API error: ${error}`);
    }

    return await response.json();
  },
});

// Internal query to get restaurant config (used by action above)
export const getRestaurantConfig = internalQuery({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.restaurantId);
  },
});
