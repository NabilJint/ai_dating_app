import { AdaptiveGlassView } from "@/lib/glass";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  interests: string[];
  allInterests: string[];
  toggleInterest: (i: string) => void;
  colors: {
    primary: string;
    onBackground: string;
    surfaceVariant: string;
    outline: string;
  };
}

export default function InterestsGrid({
  interests,
  allInterests,
  toggleInterest,
  colors,
}: Props) {
  return (
    <View style={styles.grid}>
      {allInterests.map((interest) => {
        const isSelected = interests.includes(interest);
        return (
          <TouchableOpacity
            key={interest}
            onPress={() => toggleInterest(interest)}
            activeOpacity={0.8}
          >
            <AdaptiveGlassView
              style={[styles.chip, isSelected && styles.chipSelected]}
              tintColor={isSelected ? colors.primary : undefined}
              fallbackColor={
                isSelected ? colors.primary : colors.surfaceVariant
              }
              fallbackStyle={[
                styles.chipFallback,
                { borderColor: isSelected ? colors.primary : colors.outline },
              ]}
            >
              <Text
                style={[
                  styles.text,
                  { color: isSelected ? "#FFFFFF" : colors.onBackground },
                ]}
              >
                {interest}
              </Text>
            </AdaptiveGlassView>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
  },
  chipSelected: {},
  chipFallback: { borderWidth: 1.5 },
  text: { fontSize: 15, fontWeight: "600" },
});
