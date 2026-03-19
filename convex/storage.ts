import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

// Get a URL for a storage file
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Generate an upload URL for client-side uploads
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Internal query to get a media URL (used by actions)
export const getMediaUrl = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
