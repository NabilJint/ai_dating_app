import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { areUserCmpatible } from "./lib/compatibility";
import { generateChatCompletion } from "./lib/openai";
import { withResolvedPhotos } from "./lib/photos";
import { getAllMatchesForUser, getOtherUserId } from "./lib/utils";

// Types for vector search results
interface VectorSearchResult {
  _id: Id<"users">;
  _score: number;
}

// get all matches for a user
export const getMatches = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const allMatches = await getAllMatchesForUser(ctx, args.userId);

    // get the other user profiles with resolved photos
    const matchesWithProfile = await Promise.all(
      allMatches.map(async (matche) => {
        const otherUserId = getOtherUserId(matche, args.userId);
        const otherUser = await ctx.db.get(otherUserId);
        const otherUserWithPhoto = await withResolvedPhotos(ctx, otherUser);

        return {
          ...matche,
          otherUser: otherUserWithPhoto,
        };
      }),
    );

    return matchesWithProfile.sort((a, b) => b.matchedAt - a.matchedAt);
  },
});

// Check if two users have matched
export const checkMatch = query({
  args: { user1Id: v.id("users"), user2Id: v.id("users") },
  async handler(ctx, args) {
    // check both orderings
    const match1 = await ctx.db
      .query("matches")
      .withIndex("by_user1", (q) => q.eq("user1Id", args.user1Id))
      .filter((q) => q.eq(q.field("user2Id"), args.user2Id))
      .first();

    if (match1) return match1;

    const match2 = await ctx.db
      .query("matches")
      .withIndex("by_user1", (q) => q.eq("user1Id", args.user2Id))
      .filter((q) => q.eq(q.field("user2Id"), args.user1Id))
      .first();

    return match2;
  },
});

// create a match (internal - called when mutual like detected)
export const createMatch = internalMutation({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
  },

  async handler(ctx, args): Promise<Id<"matches">> {
    return await ctx.db.insert("matches", {
      user1Id: args.user1Id,
      user2Id: args.user2Id,
      matchedAt: Date.now(),
    });
  },
});

// Update match with AI explanation
export const updateMatchExplanation = internalMutation({
  args: { matchId: v.id("matches"), aiExplanation: v.string() },
  async handler(ctx, args_0) {
    await ctx.db.patch(args_0.matchId, {
      aiExplanation: args_0.aiExplanation,
    });
  },
});

// internal query to get matches
export const getInternalMatch = internalQuery({
  args: { matchId: v.id("matches") },
  async handler(ctx, args_0) {
    return await ctx.db.get(args_0.matchId);
  },
});

// Get match for both users with resolved photos
export const getMatchWithUsers = query({
  args: { matchId: v.id("matches") },
  async handler(ctx, args_0): Promise<any> {
    const match = await ctx.runQuery(internal.matches.getInternalMatch, {
      matchId: args_0.matchId,
    });

    const user1 = await ctx.runQuery(internal.users.getInternalWithPhotos, {
      id: match?.user1Id!,
    });
    const user2 = await ctx.runQuery(internal.users.getInternalWithPhotos, {
      id: match?.user2Id!,
    });

    if (!user1 || !user2) return null;

    return {
      ...match,
      user1: user1,
      user2: user2,
    };
  },
});

// Generate AI explanation for a match
export const generateMatchExplanation = action({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args): Promise<string> => {
    const match = await ctx.runQuery(internal.matches.getInternalMatch, {
      matchId: args.matchId,
    });

    if (!match) throw new Error("Match not found");

    const user1 = await ctx.runQuery(internal.users.getInternal, {
      id: match.user1Id,
    });
    const user2 = await ctx.runQuery(internal.users.getInternal, {
      id: match.user2Id,
    });

    if (!user1 || !user2) throw new Error("Users not found");

    const prompt: string = `You are a friendly matchmaker. Given these two dating profiles, explain in 2-3 warm, encouraging sentences why they would be compatible. Be specific about their shared interests.

            Profile 1:
            Name: ${user1.name}
            Bio: ${user1.bio}
            Interests: ${user1.interests.join(", ")}

            Profile 2:
            Name: ${user2.name}
            Bio: ${user2.bio}
            Interests: ${user2.interests.join(", ")}

            Write a brief, personalized match explanation:`;

    const explanation: string = await generateChatCompletion(prompt, {
      maxTokens: 150,
      temperature: 0.7,
    });

    await ctx.runMutation(internal.matches.updateMatchExplanation, {
      matchId: args.matchId,
      aiExplanation: explanation,
    });
    return explanation;
  },
});

// ============================================
// DAILY PICKS - 3 premium AI-curated matches per day
// ============================================

// Types for daily picks
interface DailyPick {
  pickedUserId: Id<"users">;
  score: number;
  aiExplanation: string;
  sharedInterests: string[];
  status: "pending" | "liked" | "passed";
}

interface DailyPickWithUser extends DailyPick {
  user: Doc<"users">;
}

// Get today's daily picks for a user
export const getDailyPicks = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();

    // find exusting daily pick
    const existingPicks = await ctx.db
      .query("dailyPicks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // If no picks or expired, return null (frontend will trigger generation)
    if (!existingPicks || existingPicks.expiresAt < now) {
      return null;
    }

    // Get user profile for each daily picks
    const pickWithUsers: DailyPickWithUser[] = [];

    for (const pick of existingPicks.picks) {
      const user = await ctx.runQuery(internal.users.getInternalWithPhotos, {
        id: pick.pickedUserId,
      });

      if (user) {
        pickWithUsers.push({
          ...pick,
          user,
        });
      }
    }

    return {
      ...existingPicks,
      picks: pickWithUsers,
    };
  },
});

// Internal query for daily picks (used by actions)
export const getDailyPicksInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyPicks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Save or update daily picks (internal)
export const saveDailyPicks = internalMutation({
  args: {
    userId: v.id("users"),
    picks: v.array(
      v.object({
        pickedUserId: v.id("users"),
        score: v.float64(),
        aiExplanation: v.string(),
        sharedInterests: v.array(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("liked"),
          v.literal("passed"),
        ),
      }),
    ),
    generatedAt: v.number(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete any existing picks for this user
    const existing = await ctx.db
      .query("dailyPicks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Insert new picks
    return await ctx.db.insert("dailyPicks", {
      userId: args.userId,
      picks: args.picks,
      generatedAt: args.generatedAt,
      expiresAt: args.expiresAt,
    });
  },
});

// Update pick status (like/pass)
export const updatePickStatus = internalMutation({
  args: {
    dailyPicksId: v.id("dailyPicks"),
    pickedUserId: v.id("users"),
    status: v.union(v.literal("liked"), v.literal("passed")),
  },
  handler: async (ctx, args) => {
    //Get the daily picks
    const dailyPicks = await ctx.db.get(args.dailyPicksId);
    if (!dailyPicks) return;

    // Update status
    const updatedPick = dailyPicks.picks.map((pick) => {
      return pick.pickedUserId === args.pickedUserId
        ? { ...pick, status: args.status }
        : pick;
    });

    await ctx.db.patch(args.dailyPicksId, {
      picks: updatedPick,
    });
  },
});

// Generate daily picks with AI explanations
export const generateDailyPicks = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getInternal, {
      id: args.userId,
    });

    if (!user || !user.embedding) {
      throw new Error("User not found or has no embedding");
    }

    // Vector search for similar profiles
    const results: VectorSearchResult[] = await ctx.vectorSearch(
      "users",
      "by_embedding",
      {
        vector: user.embedding,
        limit: 30,
      },
    );


    // Filter and get top 3 picks
    const topPicks: {
      userId: Id<"users">;
      score: number;
      user: Doc<"users">;
    }[] = [];

    for (const result of results) {
      if (topPicks.length >= 3) break;

      // Skip self
      if (result._id === args.userId) continue;

      const candidate = await ctx.runQuery(internal.users.getInternal, {
        id: result._id,
      });

      if (!candidate) continue;

      // Check compatibility (gender, age, distance preferences)
      if (!areUserCmpatible(user, candidate)) continue;

      // Check if already swiped
      const existingSwipe = await ctx.runQuery(internal.swipes.getSwipeInternal, {
        swiperId: args.userId,
        swipedId: result._id,
      });

      if (existingSwipe) continue;

      topPicks.push({
        userId: result._id,
        score: result._score,
        user: candidate,
      });
    }

    if (topPicks.length === 0) {
      // No picks available
      const now = Date.now();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      await ctx.runMutation(internal.matches.saveDailyPicks, {
        userId: args.userId,
        picks: [],
        generatedAt: now,
        expiresAt: midnight.getTime(),
      });

      return { success: true, count: 0 };
    }

    // Generate AI explanations for each pick
    const picksWithExplanations: DailyPick[] = [];

    for (const pick of topPicks) {
      // Find shared interests
      const sharedInterests = user.interests.filter((interest) =>
        pick.user.interests.includes(interest),
      );

      // Generate AI explanation
      const prompt = `You are a friendly matchmaker for a dating app. Given these two profiles, write ONE short, warm sentence (max 20 words) explaining why they might be compatible. Focus on their shared interests or complementary traits. Be specific and encouraging.

User 1:
Name: ${user.name}
Bio: ${user.bio}
Interests: ${user.interests.join(", ")}

User 2:
Name: ${pick.user.name}
Bio: ${pick.user.bio}
Interests: ${pick.user.interests.join(", ")}

Write a brief match insight:`;

      let aiExplanation = "You two seem like a great match!";

      try {
        aiExplanation = (
          await generateChatCompletion(prompt)
        ).trim();
        //   await generateChatCompletion(prompt, {
        //     maxTokens: 60,
        //     temperature: 0.8,
        //   })
        // ).trim();
      } catch (error) {
        console.error("Failed to generate AI explanation:", error);
      }

      picksWithExplanations.push({
        pickedUserId: pick.userId,
        score: pick.score,
        aiExplanation: aiExplanation,
        sharedInterests,
        status: "pending",
      });
    }
    // Calculate expiry at midnight
    const now = Date.now();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    // Save picks
    await ctx.runMutation(internal.matches.saveDailyPicks, {
      userId: args.userId,
      picks: picksWithExplanations,
      generatedAt: now,
      expiresAt: midnight.getTime(),
    });

    return {
      success: true,
      count: picksWithExplanations.length,
    };
  },
});

// Action to handle like/pass on a daily pick (creates swipe + checks for match)
export const actOnDailyPick = action({
  args: {
    userId: v.id("users"),
    pickedUserId: v.id("users"),
    action: v.union(v.literal("like"), v.literal("pass")),
  },
  async handler(
    ctx,
    args_0,
  ): Promise<{ matched: boolean; matchId: Id<"matches"> | null }> {
    // Get daily picks record
    const dailyPicks = await ctx.runQuery(
      internal.matches.getDailyPicksInternal,
      {
        userId: args_0.userId,
      },
    );

    if (!dailyPicks) throw new Error("No daily picks found");

    // Update pick status
    await ctx.runMutation(internal.matches.updatePickStatus, {
      dailyPicksId: dailyPicks._id,
      pickedUserId: args_0.pickedUserId,
      status: args_0.action === "like" ? "liked" : "passed",
    });

    // If liked, create a swipe (this will also check for mutual match)
    if (args_0.action === "like") {
      const swipeResult: {
        matched: boolean;
        matchId: Id<"matches"> | null;
      } = await ctx.runMutation(internal.swipes.createSwipeInternal, {
        swiperId: args_0.userId,
        swipedId: args_0.pickedUserId,
        action: "like",
      });

      return swipeResult;
    }

    // If passed, also record as a reject swipe so they don't appear again
    await ctx.runMutation(internal.swipes.createSwipeInternal, {
      swiperId: args_0.userId,
      swipedId: args_0.pickedUserId,
      action: "reject",
    });

    return { matched: false, matchId: null };
  },
});
