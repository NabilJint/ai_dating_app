import { api } from "@/convex/_generated/api";
import { useAppTheme } from "@/lib/theme";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function AppLayout() {
  const { user } = useUser();
  const { colors } = useAppTheme();

  const profile = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  const hasProfile = profile !== null;

  if (profile === undefined ) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={"large"} color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* OnBoarding when profile does not exist */}
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* Main when profile does exist */}

      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="edit-profile"
          options={{ headerShown: true, title: "Edit Profile" }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: true, title: "Chat" }}
        />
        {/* <Stack.Screen name="profile/[id]" options={{ presentation: "modal" }} /> */}
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
