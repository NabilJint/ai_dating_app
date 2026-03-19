import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

/**
 * Helper to resolve photo storage IDs to URLs
 * Handles both storage IDs (from uploads) and direct URLs (from demo profiles)
 */
export const resolvePhotoUrls = async (ctx: QueryCtx, photos: string[]) => {
  const resolveUrls = await Promise.all(
    photos.map(async (photo) => {
      // If it's already a URL, return as-is (for demo profiles with Unsplash URLs)
      if (photo.startsWith("http://") || photo.startsWith("https://")) {
        return photo;
      }
      // Otherwise, treat as storage ID and resolve to URL
      try {
        const url = await ctx.storage.getUrl(photo as Id<"_storage">);
        return url || photo; // Fallback to original if URL fetch fails
      } catch (error) {
        return photo; // Fallback to original on error
      }
    }),
  );

  return resolveUrls.filter((url): url is string => url != null);
};

/**
 * Helper to add resolved photo URLs to a user object
 */

export async function withResolvedPhotos<T extends Doc<"users"> | null>(
  ctx: QueryCtx,
  user: T,
): Promise<T> {
  if (!user) return user;

  const resolvedPhotos = await resolvePhotoUrls(ctx, user.photos);
  return { ...user, photos: resolvedPhotos };
}

/**
 * Helper to add resolved photo URLs to an array of users
 */

export async function withResolvedPhotosArray(
  ctx: QueryCtx,
  users: Doc<"users">[],
) {
  return Promise.all(
    users.map((user) => withResolvedPhotos(ctx, user)) as Promise<
      Doc<"users">
    >[],
  );
}
