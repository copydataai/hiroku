import { v } from "convex/values";
import { internalMutation, internalQuery, internalAction, action } from "./_generated/server";
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
    mediaId: v.optional(v.string()),
    mediaMimeType: v.optional(v.string()),
    mediaFilename: v.optional(v.string()),
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
    const messageId = await ctx.db.insert("messages", {
      conversationId: conversation._id,
      restaurantId: args.restaurantId,
      direction: "inbound",
      senderType: "customer",
      messageType: (args.messageType as "text" | "image" | "document" | "audio" | "video" | "location" | "template") || "text",
      content: args.content,
      whatsappMessageId: args.whatsappMessageId,
      whatsappStatus: "delivered",
      metadata: args.mediaId
        ? {
            whatsappMediaId: args.mediaId,
            mimeType: args.mediaMimeType,
            filename: args.mediaFilename,
          }
        : undefined,
    });

    // Schedule media download if this message has media
    if (args.mediaId) {
      await ctx.scheduler.runAfter(0, internal.whatsapp.downloadAndStoreMedia, {
        restaurantId: args.restaurantId,
        messageId: messageId,
        whatsappMediaId: args.mediaId,
        mimeType: args.mediaMimeType ?? "application/octet-stream",
      });
    }

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

// Internal version of sendWhatsAppMessage (called from other actions)
export const sendWhatsAppMessageInternal = internalAction({
  args: {
    restaurantId: v.id("restaurants"),
    to: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
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

// Look up a restaurant by its WhatsApp phone number ID
export const getRestaurantByWhatsAppPhone = internalQuery({
  args: { whatsappPhoneNumberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_whatsapp_phone", (q) =>
        q.eq("whatsappPhoneNumberId", args.whatsappPhoneNumberId)
      )
      .first();
  },
});

// AI auto-response orchestrator: checks config, generates response, sends it
export const handleAutoResponse = internalAction({
  args: {
    restaurantId: v.id("restaurants"),
    conversationId: v.id("conversations"),
    leadId: v.id("leads"),
    customerMessage: v.string(),
    customerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Check if restaurant has AI auto-respond enabled and WhatsApp configured
      const restaurant: any = await ctx.runQuery(
        internal.whatsapp.getRestaurantConfig,
        { restaurantId: args.restaurantId }
      );
      if (!restaurant?.aiAutoRespond) return;
      if (!restaurant?.whatsappPhoneNumberId || !restaurant?.whatsappAccessToken) {
        return; // WhatsApp not configured, skip auto-response
      }

      // Generate AI response
      const responseText: string = await ctx.runAction(
        internal.aiChatbot.generateResponse,
        {
          restaurantId: args.restaurantId,
          conversationId: args.conversationId,
          leadId: args.leadId,
          customerMessage: args.customerMessage,
        }
      );

      if (!responseText) return;

      // Send via WhatsApp
      await ctx.runAction(internal.whatsapp.sendWhatsAppMessageInternal, {
        restaurantId: args.restaurantId,
        to: args.customerPhone,
        message: responseText,
      });

      // Store bot message in DB
      await ctx.runMutation(internal.whatsapp.storeBotMessage, {
        conversationId: args.conversationId,
        restaurantId: args.restaurantId,
        content: responseText,
      });
    } catch (error) {
      console.error("Auto-response failed:", error);
    }
  },
});

export const storeBotMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    restaurantId: v.id("restaurants"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      restaurantId: args.restaurantId,
      direction: "outbound",
      senderType: "bot",
      messageType: "text",
      content: args.content,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessagePreview: args.content.substring(0, 100),
      lastMessageAt: Date.now(),
    });
  },
});

// Download media from WhatsApp and store in Convex file storage
export const downloadAndStoreMedia = internalAction({
  args: {
    restaurantId: v.id("restaurants"),
    messageId: v.id("messages"),
    whatsappMediaId: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Step 1: Get the media URL from WhatsApp
      const restaurant: any = await ctx.runQuery(
        internal.whatsapp.getRestaurantConfig,
        { restaurantId: args.restaurantId }
      );
      if (!restaurant?.whatsappAccessToken) return;

      const mediaInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/${args.whatsappMediaId}`,
        {
          headers: { Authorization: `Bearer ${restaurant.whatsappAccessToken}` },
        }
      );
      if (!mediaInfoResponse.ok) return;
      const mediaInfo = await mediaInfoResponse.json();

      // Step 2: Download the actual media file
      const mediaResponse = await fetch(mediaInfo.url, {
        headers: { Authorization: `Bearer ${restaurant.whatsappAccessToken}` },
      });
      if (!mediaResponse.ok) return;
      const blob = await mediaResponse.blob();

      // Step 3: Store in Convex file storage
      const storageId = await ctx.storage.store(blob);

      // Step 4: Update the message record with the storage ID
      await ctx.runMutation(internal.whatsapp.attachMediaToMessage, {
        messageId: args.messageId,
        mediaStorageId: storageId,
      });
    } catch (error) {
      console.error("Failed to download WhatsApp media:", error);
    }
  },
});

// Attach a downloaded media file to a message record
export const attachMediaToMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    mediaStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      mediaStorageId: args.mediaStorageId,
    });
  },
});

// Send a media message (image, document, audio, video) via WhatsApp Business API
export const sendWhatsAppMediaMessage = internalAction({
  args: {
    restaurantId: v.id("restaurants"),
    to: v.string(),
    mediaUrl: v.string(),
    mediaType: v.string(), // "image", "document", "audio", "video"
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const restaurant: any = await ctx.runQuery(
      internal.whatsapp.getRestaurantConfig,
      { restaurantId: args.restaurantId }
    );
    if (!restaurant?.whatsappPhoneNumberId || !restaurant?.whatsappAccessToken) {
      throw new Error("WhatsApp not configured");
    }

    const mediaPayload: any = { link: args.mediaUrl };
    if (args.caption) mediaPayload.caption = args.caption;

    const response = await fetch(
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
          type: args.mediaType,
          [args.mediaType]: mediaPayload,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WhatsApp media API error: ${error}`);
    }

    return await response.json();
  },
});
