import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import AppProviders from "@/providers";
import { useAuth } from "@clerk/clerk-expo";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { isSignedIn } = useAuth();



  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens - only accessible when NOT signed in */}
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* App screens - only accessible when signed in */}
        <Stack.Protected guard={!!isSignedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
