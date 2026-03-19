import { GlassButton } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { DateOfBirthPicker } from "@/components/Preferences";

import { getDefaultDateOfBirth } from "@/convex/lib/utils";
import { useAppTheme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function BirthdayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);
  const { colors } = useAppTheme();

  const [birthDate, setBirthDate] = useState<Date>(getDefaultDateOfBirth());

  const handleContinue = () => {
    router.push({
      pathname: "/(app)/onboarding/gender",
      params: { ...params, dateOfBirth: birthDate.getTime().toString() },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <QuestionHeader
          icon="calendar-outline"
          title="When's your birthday?"
          subtitle="Your age will be shown on your profile"
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.pickerContainer}
        >
          <DateOfBirthPicker value={birthDate} onChange={setBirthDate} />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={styles.footer}
      >
        <GlassButton onPress={handleContinue} label="Continue" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  pickerContainer: { alignItems: "center", gap: 24 },
  footer: { padding: 24 },
});
