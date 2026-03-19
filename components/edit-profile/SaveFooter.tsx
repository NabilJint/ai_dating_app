import { AdaptiveGlassView } from "@/lib/glass";
import { AppColors } from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  isValid: boolean;
  isSaving: boolean;
  onSave: () => void;
  insetBottom: number;
  backgroundColor: string;
}

export default function SaveFooter({
  isValid,
  isSaving,
  onSave,
  insetBottom,
  backgroundColor,
}: Props) {
  return (
    <AdaptiveGlassView
      style={[styles.footer, { paddingBottom: insetBottom }]}
      fallbackColor={backgroundColor}
      fallbackStyle={styles.footerFallback}
    >
      <TouchableOpacity
        style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={!isValid || isSaving}
        activeOpacity={0.9}
      >
        {isValid ? (
          <AdaptiveGlassView
            style={styles.saveButtonInner}
            tintColor={isValid ? AppColors.primary : undefined}
          >
            {isSaving ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </AdaptiveGlassView>
        ) : (
          <LinearGradient
            colors={[backgroundColor, backgroundColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonInner}
          >
            {isSaving ? (
              <Text style={[styles.saveButtonText, { color: "#999" }]}>
                Saving...
              </Text>
            ) : (
              <Text style={[styles.saveButtonText, { color: "#999" }]}>
                Save Changes
              </Text>
            )}
          </LinearGradient>
        )}
      </TouchableOpacity>
    </AdaptiveGlassView>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  footerFallback: { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  saveButton: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#FF4458",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: { shadowOpacity: 0, elevation: 0 },
  saveButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
});
