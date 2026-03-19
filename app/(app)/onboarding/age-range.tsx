import { GlassButton } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { AdaptiveGlassView } from "@/lib/glass";
import { useAppTheme } from "@/lib/theme";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function ageRangeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);

  const { colors } = useAppTheme();

  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(35);

  const handleMinChange = (value: number) => {
    const round = Math.round(value);
    if (round !== minAge) {
      setMinAge(Math.min(round, maxAge - 1));
    }
  };

  const handleMaxAge = (value: number) => {
    const round = Math.round(value);
    if (round !== maxAge) {
      setMaxAge(Math.max(round, minAge + 1));
    }
  };

  const handleNext = () => {
    router.push({
      pathname: "/(app)/onboarding/location",
      params: {
        ...params,
        minAgeRange: minAge.toString(),
        maxAgeRange: maxAge.toString(),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <QuestionHeader
          icon="options-outline"
          title="Age range"
          subtitle="Set your preferred age range for matches"
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.rangeContainer}
        >
          <AdaptiveGlassView
            style={styles.rangeDisplay}
            fallbackColor={colors.primaryContainer}
          >
            <Text style={[styles.rangeText, { color: colors.primary }]}>
              {minAge} – {maxAge}
            </Text>
            <Text
              style={[styles.rangeLabel, { color: colors.onPrimaryContainer }]}
            >
              years old
            </Text>
          </AdaptiveGlassView>

          <View style={styles.slidersContainer}>
            <View style={styles.sliderRow}>
              <Text
                style={[styles.sliderLabel, { color: colors.onSurfaceVariant }]}
              >
                Minimum age
              </Text>
              <Text style={[styles.sliderValue, { color: colors.primary }]}>
                {minAge}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              value={minAge}
              minimumValue={18}
              maximumValue={65}
              onValueChange={handleMinChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surfaceVariant}
              thumbTintColor={colors.primary}
              step={1}
            />

            <View style={[styles.sliderRow, { marginTop: 32 }]}>
              <Text
                style={[styles.sliderLabel, { color: colors.onSurfaceVariant }]}
              >
                Maximum age
              </Text>
              <Text style={[styles.sliderValue, { color: colors.primary }]}>
                {maxAge}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={65}
              value={maxAge}
              onValueChange={handleMaxAge}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surfaceVariant}
              thumbTintColor={colors.primary}
              step={1}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={styles.footer}
      >
        <GlassButton onPress={handleNext} label="Continue" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  rangeContainer: { gap: 32 },
  rangeDisplay: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    alignSelf: "center",
  },
  rangeText: { fontSize: 48, fontWeight: "800", letterSpacing: -1 },
  rangeLabel: { fontSize: 18, fontWeight: "500", marginTop: -4 },
  slidersContainer: { paddingHorizontal: 8 },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderLabel: { fontSize: 16, fontWeight: "500" },
  sliderValue: { fontSize: 20, fontWeight: "700" },
  slider: { width: "100%", height: 40 },
  footer: { padding: 24 },
});
