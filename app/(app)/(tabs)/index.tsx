import { MatchModal } from "@/components/matches";
import { FloatingActions, ProfileView } from "@/components/Profile";
import { EmptyState, LoadingScreen } from "@/components/ui";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAppTheme } from "@/lib/theme";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartPage() {
  const { colors } = useAppTheme();

  const { currentUser } = useCurrentUser();
  const router = useRouter();

  const swipeFeed = useQuery(api.swipes.getSwipeFeed, {
    userId: currentUser?._id!,
  });

  // createSwipe
  const createSwipe = useMutation(api.swipes.createSwipe);

  //state
  const [matchedUser, setMatchedUser] = useState<Doc<"users"> | null>(null);
  const [matchId, setMatchId] = useState<Id<"users"> | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  // Filter out locally swiped profiles for instant feedback (optimistic update)
  const visibleFeed =
    swipeFeed?.filter((feed) => !swipedIds.has(feed._id)) ?? [];
  const currentProfile = visibleFeed[0];

  async function handleAction(action: "like" | "reject") {
    if (!currentProfile._id || !currentUser?._id) return;

    const profileToSwipe = currentProfile;

    // Optimistically remove profile from feed immediately
    setSwipedIds((prev) => new Set(prev).add(profileToSwipe._id));

    // Fire mutation in background (don't await)
    createSwipe({
      swiperId: currentUser._id,
      swipedId: profileToSwipe._id,
      action,
    })
      .then((result) => {
        if (result.matchId || result.matched) {
          setMatchedUser(profileToSwipe);
          setMatchId(matchId);
          setShowMatchModal(true);
        }
      })
      .catch((error) => {
        console.error("Failed to record action:", error);
        // Revert optimistic update on error
        setSwipedIds((prev) => {
          const next = new Set(prev);
          next.delete(profileToSwipe._id);
          return next;
        });
      });
  }

  const handleLike = () => handleAction("like");
  const handleReject = () => handleAction("reject");

  const handleSendMessage = () => {
    setShowMatchModal(false);
    if (matchId) {
      router.push(`/(app)/chat/${matchId}`);
    }
  };

  const handleKeepSwiping = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
    setMatchId(null);
  };
  // Loading swipe feed
  if (swipeFeed === undefined) {
    return <LoadingScreen message="Finding people near you..." />;
  }

  // Still loading from Convex (protected route handles no-profile case)
  if (currentUser === undefined || currentUser === null) {
    return <LoadingScreen />;
  }

  if (!currentProfile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <EmptyState
          icon="people-outline"
          title="No more profiles"
          subtitle="Check back later for new matches"
        />
      </SafeAreaView>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile View with fade transition */}
      <Animated.View
        key={currentProfile._id}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.profileContainer}
      >
        <ProfileView user={currentProfile} distance={currentProfile.distance} />
      </Animated.View>
      {/* Floating Action Buttons */}
      <FloatingActions
        onReject={handleReject}
        onLike={handleLike}
        disabled={!currentProfile}
      />

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        currentUser={currentUser}
        matchedUser={matchedUser}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
  },
});
