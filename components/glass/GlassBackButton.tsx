import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { GlassIconButton } from "./GlassIconButton";
import React from "react";
import { useAppTheme } from "@/lib/theme";

interface GlassBackButtonProps {
  /** Custom onPress handler. If not provided, navigates back using router.back() */
  onPress?: () => void;
}

/**
 * A glass-effect back button with an arrow icon.
 * Navigates back by default, or calls custom onPress if provided.
*/
const { colors, isDark } = useAppTheme();
export function GlassBackButton({ onPress }: GlassBackButtonProps = {}) {
  const router = useRouter();

  const handleBack = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <GlassIconButton
      icon={<Text style={styles.backIcon}>←</Text>}
      onPress={handleBack}
    />
  );
}

const styles = StyleSheet.create({
  backIcon: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
});
