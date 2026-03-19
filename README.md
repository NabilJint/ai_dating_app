# AI Dating — Mobile

> A production-grade, realtime dating platform built with Expo, React Native, and Convex. Designed for scalability, performance, and clean architecture.

---

## System Design

### High-Level Architecture

```id="sys-arch"
                ┌──────────────────────────┐
                │        Mobile App        │
                │  (Expo + React Native)   │
                └──────────┬───────────────┘
                           │
                           │ HTTPS / WebSocket
                           ▼
                ┌──────────────────────────┐
                │        Convex            │
                │  (Realtime Backend)      │
                │ - Queries                │
                │ - Mutations              │
                │ - Subscriptions          │
                └──────────┬───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Auth       │  │   Storage    │  │   AI Layer   │
│  (Clerk)     │  │ (Photos)     │  │ (OpenAI)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

### Data Flow

```id="data-flow"
User Action
   │
   ▼
UI Component (React Native)
   │
   ▼
Custom Hook (Business Logic)
   │
   ▼
Convex Mutation / Query
   │
   ▼
Database Update / Fetch
   │
   ▼
Realtime Sync (Subscription)
   │
   ▼
UI Re-render
```

---

## Convex Schema & API Design

### Core Entities

```ts id="schema-core"
users {
  _id: Id<"users">
  name: string
  email?: string
  bio?: string
  dob: number
  interests: string[]
  location?: {
    lat: number
    lng: number
    city?: string
  }
  createdAt: number
}

profiles {
  userId: Id<"users">
  photos: string[]
  preferences: {
    minAge: number
    maxAge: number
    distance: number
  }
}

matches {
  _id: Id<"matches">
  userA: Id<"users">
  userB: Id<"users">
  status: "pending" | "matched" | "rejected"
  createdAt: number
}
```

---

### Example Queries

```ts id="queries"
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
  },
});
```

---

### Example Mutations

```ts id="mutations"
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.string(),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      bio: args.bio,
      interests: args.interests,
    });
  },
});
```

---

## Monorepo Strategy (Scalable Setup)

```id="monorepo"
root/
├── apps/
│   ├── mobile/          # Expo app
│   └── web/             # (optional future Next.js app)
│
├── packages/
│   ├── ui/              # Shared components
│   ├── config/          # ESLint, TS, Tailwind configs
│   ├── hooks/           # Shared hooks
│   └── types/           # Shared TypeScript types
│
├── convex/              # Backend (shared)
├── package.json
├── pnpm-workspace.yaml
```

---

### Benefits

* Shared UI across platforms
* Centralized types (no duplication)
* Easier scaling to web/admin dashboards
* Cleaner dependency boundaries


## Badges (Top-tier Repo Signal)

```md id="badges"
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-Managed-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB?logo=react&logoColor=black)
![Convex](https://img.shields.io/badge/Backend-Convex-orange)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-10A37F?logo=openai&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
```

---

## Linting & Formatting

### ESLint

```js id="eslint"
module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
};
```

---

### Prettier

```json id="prettier"
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

---

## Scaling Strategy

### Phase 1 (Current)

* Profiles
* Photo uploads
* Basic matching

### Phase 2

* Chat system (Convex subscriptions)
* Push notifications
* Swipe engine

### Phase 3

* AI matchmaking (embedding similarity)
* Recommendation engine
* Abuse detection / moderation

---

## Performance Considerations

* Minimize re-renders via hooks isolation
* Use Convex subscriptions selectively
* Lazy-load heavy components
* Optimize image uploads (compression)

---

## Security Considerations

* Validate all mutations server-side
* Secure media uploads
* Avoid exposing API keys in client
* Use Clerk session validation

---

## Future Improvements

* End-to-end encryption for chats
* Offline-first caching
* Graph-based matching algorithm
* Analytics pipeline

---

## Summary

This project is structured to:

* Scale cleanly
* Maintain developer velocity
* Support realtime features reliably

---

Built like a system, not just an app.
