/**
 * Hook to get the current user from Convex based on the Clerk user ID.
 * Combines the Clerk user state with the Convex user profile query.
 */

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";

export const useCurrentUser = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const currentUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip",
  );

  return {
    /** The current user's Convex profile */
    currentUser,
    /** Whether Clerk has finished loading */
    isLoaded,
    /** The Clerk user object */
    clerkUser,
    /** True while Clerk is loading or Convex query is pending */
    isLoading: !isLoaded || currentUser === undefined,
  };
};
