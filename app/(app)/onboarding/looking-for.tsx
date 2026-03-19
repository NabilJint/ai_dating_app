import { QuestionHeader } from "@/components/onboarding";
import { LookingForSelector } from "@/components/Preferences";
import { useAppTheme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";


export default function lookingForScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log("On Looking for page", params);
  const { colors } = useAppTheme();
  
  const handleNext = (lookingFor: string[]) => {
    console.log("New Params", {
      ...params,
      lookingFor: JSON.stringify(lookingFor),
    });
    router.push({
      pathname: "/(app)/onboarding/age-range",
      params: { ...params, lookingFor: JSON.stringify(lookingFor) },
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <QuestionHeader
          icon="heart-outline"
          title="I'm interested in..."
          subtitle="Who would you like to meet?"
        />
        <LookingForSelector onChange={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
});
