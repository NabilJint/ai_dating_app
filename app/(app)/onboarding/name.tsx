import { GlassButton, GlassInput } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { KeyboardAwareView } from "@/components/ui";
import { hapticButtonPress } from "@/lib/haptics";
import { useAppTheme } from "@/lib/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function NameScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  const handleContinue = () => {
    hapticButtonPress();
    router.push({
      pathname: "/(app)/onboarding/birthday",
      params: { firstName: firstName.trim(), lastName: lastName.trim() },
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareView>
        <View style={styles.content}>
          <QuestionHeader
            icon="hand-left-outline"
            title={"What's your name?"}
            subtitle={"This is how you'll appear to others"}
          />
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <GlassInput
              placeholder={"First Name"}
              value={firstName}
              onChangeText={setFirstName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
            />
            <GlassInput
              placeholder={"Last Name"}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={isValid ? handleContinue : undefined}
            />
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.footer}
        >
          <GlassButton
            onPress={handleContinue}
            label="Continue"
            disabled={!isValid}
          />
        </Animated.View>
      </KeyboardAwareView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  inputContainer: { gap: 16 },
  footer: { padding: 24 },
});
