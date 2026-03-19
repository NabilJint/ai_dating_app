import { GlassButton, GlassChip } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { INTERESTS, MAX_INTERESTS, MIN_INTERESTS } from "@/lib/constants";
import { useAppTheme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function InterestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);
  const { colors } = useAppTheme();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelected((prev) => {
      if (prev.includes(interest)) {
        prev.filter((i) => i != interest);
      }
      if (selected.length < MAX_INTERESTS) {
        return [...prev, interest];
      }

      return prev;
    });
  };

  const isValid = selected.length >= MAX_INTERESTS;

  const onHandleNext = () => {
    router.push({
      pathname: "/(app)/onboarding/photos",
      params: { ...params, interests: JSON.stringify(selected) },
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <QuestionHeader
          icon="heart-outline"
          title="Your interests"
          subtitle={`Select ${MIN_INTERESTS}-${MAX_INTERESTS} things you love`}
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.countBadge}
        >
          <Text
            style={[
              styles.countText,
              { color: isValid ? colors.primary : colors.onSurfaceVariant },
            ]}
          >
            {selected.length} of {MAX_INTERESTS} selected
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.interestsContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.interestsGrid}
          >
            {INTERESTS.map((interest) => (
              <GlassChip
                key={interest.name}
                emoji={interest.emoji}
                label={interest.name}
                selected={selected.includes(interest.name)}
                onPress={() => toggleInterest(interest.name)}
              />
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.footer}
        >
          <GlassButton
            onPress={onHandleNext}
            label="Complete Profile"
            disabled={!isValid}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 16, paddingHorizontal: 24 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  countBadge: { marginBottom: 16 },
  countText: { fontSize: 15, fontWeight: "600" },
  scrollView: { flex: 1, overflow: "hidden" },
  interestsContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  interestsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  footer: { padding: 24 },
});
