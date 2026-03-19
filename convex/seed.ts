import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalMutation } from "./_generated/server";
import { generateEmbedding } from "./lib/openai";
import {
  buildProfileText,
  calculateAge,
  getAllMatchesForUser,
} from "./lib/utils";
import { demoProfiles } from "./sampleData/demoProfiles";
import { areUserCmpatible } from "./lib/compatibility";

/**
 * =============================================================================
 * SEED DATA UTILITIES
 * =============================================================================
 *
 * CLI COMMANDS:
 *
 * 1. Seed demo profiles (creates 10 fake users with embeddings):
 *    npx convex run seed:seedDemoProfiles
 *
 * 2. Seed swipes for a user (makes demo users like a specific user):
 *    npx convex run seed:seedSwipesForUser '{"clerkId": "user_xxx"}'
 *
 *    With limited likes:
 *    npx convex run seed:seedSwipesForUser '{"clerkId": "user_xxx", "likeCount": 3}'
 *
 * 3. Clear all demo profiles (and their swipes/matches/messages):
 *    npx convex run seed:clearDemoProfiles
 *
 * 4. Clear all swipes (useful for resetting swipe state):
 *    npx convex run seed:clearSwipes
 *
 * 5. Clear daily picks (reset AI matches so they regenerate):
 *    npx convex run seed:clearDailyPicks
 *
 *    For a specific user:
 *    npx convex run seed:clearDailyPicks '{"clerkId": "user_xxx"}'
 *
 * =============================================================================
 */

// Internal mutation to create a demo user
export const createDemoUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    dateOfBirth: v.number(), // Unix timestamp
    gender: v.string(),
    bio: v.string(),
    lookingFor: v.array(v.string()),
    ageRange: v.object({
      min: v.number(),
      max: v.number(),
    }),
    interests: v.array(v.string()),
    photos: v.array(v.string()),
    embedding: v.array(v.float64()),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    maxDistance: v.optional(v.number()), // undefined = unlimited (no distance filter)
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const now = Date.now();
    const age = calculateAge(args.dateOfBirth);
    // Only include maxDistance if it's defined
    const { maxDistance, ...rest } = args;
    return await ctx.db.insert("users", {
      ...rest,
      age, // Computed from dateOfBirth for vector index filtering
      ...(maxDistance !== undefined && { maxDistance }),
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Seed all demo profiles with embeddings
 * CLI: npx convex run seed:seedDemoProfiles
 */
export const seedDemoProfiles = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; count: number }> => {
    let count = 0;

    for (const profile of demoProfiles) {
      // Generate embedding for profile
      const profileText = buildProfileText(profile.bio, profile.interests);

      let embedding: number[];
      try {
        embedding = await generateEmbedding(profileText);
      } catch (error) {
        console.error(
          `Failed to generate embedding for ${profile.name}`,
          error,
        );
        continue;
      }

      // Create demo user with unique clerkId
      const clerkId = `demo_${profile.name.toLowerCase()}_${Date.now()}`;

      await ctx.runMutation(internal.seed.createDemoUser, {
        ...profile,
        clerkId,
        embedding,
      });

      count++;
      console.log(`Created demo profile: ${profile.name}`);
    }

    return { success: true, count };
  },
});

// Internal mutation to delete all demo users
export const deleteDemoUsers = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deletedCount: number }> => {
    // Find all users with clerkId starting with "demo_"
    const allUsers = await ctx.db.query("users").collect();
    const demoUsers = allUsers.filter((user) =>
      user.clerkId.startsWith("demo_"),
    );

    let deletedCount = 0;
    for (const user of demoUsers) {
      // Delete associated swipes (where user is swiper or swiped)
      const swipesAsSwiper = await ctx.db
        .query("swipes")
        .withIndex("by_swiper", (q) => q.eq("swiperId", user._id))
        .collect();
      const swipesAsSwiped = await ctx.db
        .query("swipes")
        .withIndex("by_swiped", (q) => q.eq("swipedId", user._id))
        .collect();

      for (const swipe of [...swipesAsSwiper, ...swipesAsSwiped]) {
        await ctx.db.delete(swipe._id);
      }

      // Delete associated matches
      const allMatches = await getAllMatchesForUser(ctx, user._id);

      for (const match of allMatches) {
        // Delete messages for this match
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))
          .collect();
        for (const message of messages) {
          await ctx.db.delete(message._id);
        }
        await ctx.db.delete(match._id);
      }

      // Delete the user
      await ctx.db.delete(user._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});

/**
 * Clear all demo profiles and their associated data
 * CLI: npx convex run seed:clearDemoProfiles
 */
export const clearDemoProfiles = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; deletedCount: number }> => {
    const result = await ctx.runMutation(internal.seed.deleteDemoUsers, {});
    console.log(`Deleted ${result.deletedCount} demo profiles`);
    return { success: true, deletedCount: result.deletedCount };
  },
});

// Internal mutation to delete all swipes
export const deleteAllSwipes = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deletedCount: number }> => {
    const allSwipes = await ctx.db.query("swipes").collect();

    for (const swipe of allSwipes) {
      await ctx.db.delete(swipe._id);
    }

    return { deletedCount: allSwipes.length };
  },
});

/**
 * Clear all swipes (useful for resetting swipe state during testing)
 * CLI: npx convex run seed:clearSwipes
 */
export const clearSwipes = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; deletedCount: number }> => {
    const result = await ctx.runMutation(internal.seed.deleteAllSwipes, {});
    console.log(`Deleted ${result.deletedCount} swipes`);
    return { success: true, deletedCount: result.deletedCount };
  },
});

// Internal mutation to create a swipe from demo user to target user
export const createDemoSwipe = internalMutation({
  args: {
    swiperId: v.id("users"),
    swipedId: v.id("users"),
    action: v.union(v.literal("like"), v.literal("reject")),
  },
  handler: async (ctx, args): Promise<Id<"swipes">> => {
    // Check if swipe already exists
    const existingSwipe = await ctx.db
      .query("swipes")
      .withIndex("by_swiper_and_swiped", (q) =>
        q.eq("swiperId", args.swiperId).eq("swipedId", args.swipedId),
      )
      .first();

    if (existingSwipe) {
      return existingSwipe._id;
    }

    return await ctx.db.insert("swipes", {
      swiperId: args.swiperId,
      swipedId: args.swipedId,
      action: args.action,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation to get user by clerkId
export const getUserByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Internal mutation to get all demo users
export const getAllDemoUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((user) => user.clerkId.startsWith("demo_"));
  },
});

/**
 * Seed swipes from demo profiles to a specific user
 * This simulates demo users liking the target user so they can test matching
 *
 * CLI: npx convex run seed:seedSwipesForUser '{"clerkId": "user_xxx"}'
 * With limit: npx convex run seed:seedSwipesForUser '{"clerkId": "user_xxx", "likeCount": 3}'
 */
export const seedSwipesForUser = action({
  args: {
    clerkId: v.string(),
    likeCount: v.optional(v.number()), // How many demo users should like this user (default: all)
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    likesCreated: number;
    targetUserName: string;
    likedBy: string[];
  }> => {
    // Find the target user by their Clerk ID
    const targetUser = await ctx.runMutation(internal.seed.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!targetUser) {
      throw new Error(`User with clerkId "${args.clerkId}" not found`);
    }

    // Get all demo users
    const demoUsers = await ctx.runMutation(internal.seed.getAllDemoUsers, {});

    if (demoUsers.length === 0) {
      throw new Error(
        "No demo users found. Run seedDemoProfiles first to create demo users.",
      );
    }

    // Filter demo users to only those who could potentially match with target user
    const compatibleDemoUsers = demoUsers.filter((demoUser) =>
      areUserCmpatible(demoUser, targetUser),
    );

    // Determine how many likes to create
    const likeCount = args.likeCount ?? compatibleDemoUsers.length;
    const usersToSwipe = compatibleDemoUsers.slice(0, likeCount);

    let likesCreated = 0;
    const likedBy: string[] = [];

    for (const demoUser of usersToSwipe) {
      await ctx.runMutation(internal.seed.createDemoSwipe, {
        swiperId: demoUser._id,
        swipedId: targetUser._id,
        action: "like",
      });

      likesCreated++;
      likedBy.push(demoUser.name);
      console.log(`${demoUser.name} liked ${targetUser.name}`);
    }

    return {
      success: true,
      likesCreated,
      targetUserName: targetUser.name,
      likedBy,
    };
  },
});

// Internal mutation to delete daily picks
export const deleteAllDailyPicks = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args): Promise<{ deletedCount: number }> => {
    let dailyPicks;

    if (args.userId) {
      // Delete picks for specific user
      const userPicks = await ctx.db
        .query("dailyPicks")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .first();
      dailyPicks = userPicks ? [userPicks] : [];
    } else {
      // Delete all daily picks
      dailyPicks = await ctx.db.query("dailyPicks").collect();
    }

    for (const pick of dailyPicks) {
      await ctx.db.delete(pick._id);
    }

    return { deletedCount: dailyPicks.length };
  },
});

// Internal mutation to find user by name
export const getUserByName = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.find((u) =>
      u.name.toLowerCase().includes(args.name.toLowerCase()),
    ) ?? null;
  },
});

// Internal mutation to get all matches for a user and the other user's info
export const getMatchesWithUsers = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allMatches = await getAllMatchesForUser(ctx, args.userId);
    const results = [];
    for (const match of allMatches) {
      const otherId =
        match.user1Id === args.userId ? match.user2Id : match.user1Id;
      const otherUser = await ctx.db.get(otherId);
      if (otherUser) {
        results.push({ match, otherUser });
      }
    }
    return results;
  },
});

// Internal mutation to bulk insert messages for a match
export const insertSeedMessages = internalMutation({
  args: {
    messages: v.array(
      v.object({
        matchId: v.id("matches"),
        senderId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
        read: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const msg of args.messages) {
      await ctx.db.insert("messages", msg);
    }
    return args.messages.length;
  },
});

// Conversation templates for seeding realistic chats
const conversationTemplates = [
  [
    { from: "other", text: "Hey! I loved your profile, you seem really interesting 😊" },
    { from: "me", text: "Thanks! I was just thinking the same about yours haha" },
    { from: "other", text: "So what do you do for fun when you're not on here?" },
    { from: "me", text: "Mostly hiking and trying new coffee shops. You?" },
    { from: "other", text: "Omg I'm a total coffee snob too! Have you been to Blue Bottle?" },
    { from: "me", text: "Blue Bottle is amazing. Their New Orleans iced coffee is my go-to" },
    { from: "other", text: "Okay we definitely need to go together sometime" },
    { from: "me", text: "I'd love that! When are you free?" },
    { from: "other", text: "How about this Saturday morning?" },
    { from: "me", text: "Saturday works perfectly. Let's do it ☕" },
    { from: "other", text: "It's a date then! I'm excited 😄" },
    { from: "me", text: "Me too! See you Saturday" },
  ],
  [
    { from: "me", text: "Your hiking photos are incredible! Where was that mountain shot?" },
    { from: "other", text: "That was at Mt. Tamalpais! The sunrise hike is so worth it" },
    { from: "me", text: "I've been meaning to do that one. Is it hard?" },
    { from: "other", text: "It's moderate, maybe 5 miles round trip. The views are unreal" },
    { from: "me", text: "Adding it to my list for sure" },
    { from: "other", text: "I'd be happy to show you the trail if you want company 😊" },
    { from: "me", text: "That would be awesome! I usually go on weekends" },
    { from: "other", text: "Same here. What about next Sunday?" },
    { from: "me", text: "Sounds like a plan!" },
    { from: "other", text: "Perfect, I'll pack some trail mix. Fair warning I take a lot of photos" },
    { from: "me", text: "Haha that's fine, I could use a good photographer" },
  ],
  [
    { from: "other", text: "I see you're into cooking! What's your signature dish?" },
    { from: "me", text: "Homemade pasta from scratch. It's a whole production lol" },
    { from: "other", text: "No way, I've always wanted to learn how to make fresh pasta!" },
    { from: "me", text: "It's honestly not that hard once you get the dough right" },
    { from: "other", text: "Maybe you could teach me sometime? I'll bring the wine 🍷" },
    { from: "me", text: "Deal! What kind of wine do you like?" },
    { from: "other", text: "I'm a red wine person. Pinot noir is my favorite" },
    { from: "me", text: "Great taste. Pinot pairs perfectly with pasta" },
    { from: "other", text: "Look at us already planning dinner together 😂" },
    { from: "me", text: "Hey I'm not complaining! When works for you?" },
    { from: "other", text: "How about Friday evening? I get off work at 6" },
    { from: "me", text: "Friday at 7? That gives you time to grab the wine" },
    { from: "other", text: "You're on! Can't wait 🙌" },
  ],
  [
    { from: "me", text: "Hey! We matched! Your bio made me laugh" },
    { from: "other", text: "Haha which part? I try to keep it entertaining" },
    { from: "me", text: "The part about your dog being your best wingman" },
    { from: "other", text: "It's true though! He's very charismatic" },
    { from: "me", text: "I need to meet this legendary dog" },
    { from: "other", text: "He's available for meet and greets on Saturdays at the park 🐕" },
    { from: "me", text: "Which park do you usually go to?" },
    { from: "other", text: "Golden Gate Park, near the dog play area" },
    { from: "me", text: "I love that area! I run there sometimes" },
    { from: "other", text: "Maybe we'll bump into each other then 😄" },
    { from: "me", text: "Or we could just plan to meet there this weekend?" },
    { from: "other", text: "I like the way you think. Saturday 2pm?" },
    { from: "me", text: "See you and the famous wingman there!" },
    { from: "other", text: "He's already excited, I can tell" },
  ],
  [
    { from: "other", text: "Hi there! I noticed we both love live music 🎵" },
    { from: "me", text: "Yes! What kind of music are you into?" },
    { from: "other", text: "Mostly indie and jazz. I go to shows almost every weekend" },
    { from: "me", text: "That's awesome. Any good shows coming up?" },
    { from: "other", text: "There's a great jazz trio playing at the Blue Note this Friday" },
    { from: "me", text: "Oh I've heard of them! I've been wanting to check that venue out" },
    { from: "other", text: "Want to go together? I can get us good seats" },
    { from: "me", text: "Absolutely! That sounds like an amazing first date" },
    { from: "other", text: "Right? Way better than the usual coffee date" },
    { from: "me", text: "No offense to coffee dates but yeah, this wins" },
    { from: "other", text: "Show starts at 8. Want to grab dinner before?" },
    { from: "me", text: "There's a great Thai place nearby. You like Thai food?" },
    { from: "other", text: "Love it! Okay this is going to be a great night" },
    { from: "me", text: "Can't wait! See you Friday 🎶" },
  ],
  [
    { from: "me", text: "Your travel photos are amazing! Where's your favorite place?" },
    { from: "other", text: "Japan, hands down. The food, the culture, everything" },
    { from: "me", text: "Japan is on my bucket list! Any tips?" },
    { from: "other", text: "Go in cherry blossom season. It's absolutely magical" },
    { from: "me", text: "Did you go to Tokyo or more countryside?" },
    { from: "other", text: "Both! Tokyo is electric but Kyoto stole my heart" },
    { from: "me", text: "I've heard the temples in Kyoto are incredible" },
    { from: "other", text: "They are. I have so many photos I could show you" },
    { from: "me", text: "I'd love to see them! Maybe over coffee or something?" },
    { from: "other", text: "Are you asking me on a date? 😏" },
    { from: "me", text: "Maybe I am 😄" },
    { from: "other", text: "Then the answer is yes! When?" },
    { from: "me", text: "How about tomorrow afternoon?" },
    { from: "other", text: "Tomorrow works! There's a cute café on Valencia" },
    { from: "me", text: "Perfect, send me the address. See you there!" },
  ],
  [
    { from: "other", text: "Hey you! I see we're both gym people 💪" },
    { from: "me", text: "Haha guilty! What's your workout routine like?" },
    { from: "other", text: "Mostly weightlifting and yoga. Best combo ever" },
    { from: "me", text: "I've been wanting to get into yoga actually" },
    { from: "other", text: "You should! It's amazing for recovery" },
    { from: "me", text: "Any studio recommendations?" },
    { from: "other", text: "CorePower is great for beginners. I go to the one downtown" },
    { from: "me", text: "Maybe we could go together sometime?" },
    { from: "other", text: "I'd love that! I go Tuesday and Thursday mornings" },
    { from: "me", text: "Thursday works for me. What time?" },
    { from: "other", text: "7am class. Early bird gets the zen 😂" },
    { from: "me", text: "I'm in! Fair warning I'll probably be terrible" },
    { from: "other", text: "Everyone starts somewhere. I'll help you out" },
  ],
  [
    { from: "me", text: "Okay I have to ask - is that a sourdough in your photo?" },
    { from: "other", text: "YES! I'm obsessed with bread baking 🍞" },
    { from: "me", text: "Same!! How long have you been at it?" },
    { from: "other", text: "About 2 years. My starter is named Gerald" },
    { from: "me", text: "Gerald 😂 Mine is called Yeastie Boys" },
    { from: "other", text: "Okay that's amazing. We need to have a bake-off" },
    { from: "me", text: "You're on! Loser buys dinner" },
    { from: "other", text: "Bold of you to assume you'll win 😏" },
    { from: "me", text: "My crumb structure speaks for itself" },
    { from: "other", text: "Prove it! Send me a photo" },
    { from: "me", text: "Challenge accepted. When's the bake-off happening?" },
    { from: "other", text: "This weekend? We can bake at my place, I have a great oven" },
    { from: "me", text: "It's on! Prepare to be impressed" },
    { from: "other", text: "May the best bread win 🏆" },
  ],
  [
    { from: "other", text: "Your taste in movies is impeccable based on your profile" },
    { from: "me", text: "Thank you! What movies are you into?" },
    { from: "other", text: "Sci-fi and thrillers mostly. But I have a soft spot for rom-coms" },
    { from: "me", text: "The range! Have you seen anything good lately?" },
    { from: "other", text: "Just rewatched Interstellar for the 5th time and cried again" },
    { from: "me", text: "That docking scene though. Incredible" },
    { from: "other", text: "FINALLY someone who gets it" },
    { from: "me", text: "We should do a movie night sometime" },
    { from: "other", text: "There's actually a Nolan marathon at the indie theater this week" },
    { from: "me", text: "No way! Which day?" },
    { from: "other", text: "Thursday and Friday nights. Want to go Thursday?" },
    { from: "me", text: "100% yes. I'll bring the popcorn" },
    { from: "other", text: "And I'll bring the tissues for the emotional parts 😂" },
  ],
  [
    { from: "me", text: "I see you're a book lover too! What are you reading right now?" },
    { from: "other", text: "Just started Project Hail Mary. It's SO good" },
    { from: "me", text: "Andy Weir is brilliant. The Martian is one of my all-time faves" },
    { from: "other", text: "Same! Do you do book clubs or anything?" },
    { from: "me", text: "No but I've always wanted to join one" },
    { from: "other", text: "We could start our own two-person book club 📚" },
    { from: "me", text: "That's actually a really cute idea" },
    { from: "other", text: "Right? We pick a book, read it, then discuss over dinner" },
    { from: "me", text: "I love it. What should our first pick be?" },
    { from: "other", text: "How about Klara and the Sun? It's beautiful and not too long" },
    { from: "me", text: "Kazuo Ishiguro! Great choice. I'm in" },
    { from: "other", text: "Book club meeting in 2 weeks? That enough time?" },
    { from: "me", text: "Plenty. Where should we meet?" },
    { from: "other", text: "There's a cozy wine bar on 24th that's perfect for this" },
    { from: "me", text: "Can't wait for our first book club meeting! 📖🍷" },
  ],
];

/**
 * Seed test messages for a user's matches to simulate active conversations
 * CLI: npx convex run seed:seedMessagesForUser '{"name": "Nabil"}'
 */
export const seedMessagesForUser = action({
  args: {
    name: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; matchesSeeded: number; totalMessages: number }> => {
    // Find the user by name
    const user = await ctx.runMutation(internal.seed.getUserByName, {
      name: args.name,
    });

    if (!user) {
      throw new Error(`User with name containing "${args.name}" not found`);
    }

    console.log(`Found user: ${user.name} (${user._id})`);

    // Get all matches with user info
    const matchesWithUsers = await ctx.runMutation(
      internal.seed.getMatchesWithUsers,
      { userId: user._id },
    );

    if (matchesWithUsers.length === 0) {
      throw new Error(
        `No matches found for ${user.name}. Run seedSwipesForUser first and create matches.`,
      );
    }

    console.log(`Found ${matchesWithUsers.length} matches`);

    let totalMessages = 0;

    for (let i = 0; i < matchesWithUsers.length; i++) {
      const { match, otherUser } = matchesWithUsers[i];
      const convo =
        conversationTemplates[i % conversationTemplates.length];

      // Space messages out over the last few days with realistic timing
      const now = Date.now();
      const convoStartOffset = (matchesWithUsers.length - i) * 2 * 60 * 60 * 1000; // stagger starts by 2hrs
      const baseTime = now - convoStartOffset;

      const messages = convo.map((msg, idx) => {
        // Each message is 3-15 minutes apart
        const gap = (Math.floor(Math.random() * 12) + 3) * 60 * 1000;
        const createdAt = baseTime + idx * gap;
        const senderId = msg.from === "me" ? user._id : otherUser._id;
        return {
          matchId: match._id,
          senderId,
          content: msg.text,
          createdAt,
          read: msg.from === "me" ? true : idx < convo.length - 2, // last 2 from other are unread
        };
      });

      await ctx.runMutation(internal.seed.insertSeedMessages, { messages });
      totalMessages += messages.length;
      console.log(
        `Seeded ${messages.length} messages for match with ${otherUser.name}`,
      );
    }

    return {
      success: true,
      matchesSeeded: matchesWithUsers.length,
      totalMessages,
    };
  },
});

/**
 * Clear daily picks (reset AI matches so they regenerate)
 * CLI: npx convex run seed:clearDailyPicks
 * For specific user: npx convex run seed:clearDailyPicks '{"clerkId": "user_xxx"}'
 */
export const clearDailyPicks = action({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; deletedCount: number; message: string }> => {
    let userId: Id<"users"> | undefined;

    if (args.clerkId) {
      const user = await ctx.runMutation(internal.seed.getUserByClerkId, {
        clerkId: args.clerkId,
      });

      if (!user) {
        throw new Error(`User with clerkId "${args.clerkId}" not found`);
      }

      userId = user._id;
    }

    const result = await ctx.runMutation(internal.seed.deleteAllDailyPicks, {
      userId,
    });

    const message = args.clerkId
      ? `Deleted ${result.deletedCount} daily picks for user`
      : `Deleted ${result.deletedCount} daily picks for all users`;

    console.log(message);
    return { success: true, deletedCount: result.deletedCount, message };
  },
});

