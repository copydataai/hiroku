import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

export const listByConversation = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");
    await requireRestaurantAccess(ctx, conv.restaurantId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit ?? 50);

    return messages.reverse();
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("image"),
        v.literal("document"),
        v.literal("audio"),
        v.literal("video")
      )
    ),
    mediaStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");
    await requireRestaurantAccess(ctx, conv.restaurantId);

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      restaurantId: conv.restaurantId,
      direction: "outbound",
      senderType: "agent",
      messageType: args.messageType ?? "text",
      content: args.content,
      mediaStorageId: args.mediaStorageId,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessagePreview: args.content.substring(0, 100),
      lastMessageAt: Date.now(),
    });

    // Update lead's lastMessageAt
    await ctx.db.patch(conv.leadId, { lastMessageAt: Date.now() });

    return messageId;
  },
});
