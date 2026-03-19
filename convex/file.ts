import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate Image url for client side uploaing
export const generateUploadUrl = mutation({
  args: {},
  async handler(ctx) {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get URL from a file storage
export const getUrlFromFile = query({
  args: { storageId: v.id("_storage") },
  async handler(ctx, args) {
    return ctx.storage.getUrl(args.storageId);
  },
});

// Get URL for a stored file (mutation version for use in actions/other mutations)
export const getUrlMutation = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, args) {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get URLs for multiple stored files
export const getUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  async handler(ctx, args) {
    const urls = await Promise.all(
      args.storageIds.map((id) => ctx.storage.getUrl(id)),
    );
    return urls;
  },
});
