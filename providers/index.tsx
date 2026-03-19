import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider } from "./ClerkProvider";
import { ConvexProvider } from "./ConvexProvider";
import { ThemeProvider } from "./ThemeProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider>
        <ConvexProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ConvexProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

// Re export each provider
export { ClerkProvider } from "./ClerkProvider";
export { ConvexProvider } from "./ConvexProvider";
export { ThemeProvider } from "./ThemeProvider";
