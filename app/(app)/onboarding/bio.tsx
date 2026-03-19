import { GlassButton, GlassTextArea } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { KeyboardAwareView } from "@/components/ui";
import { useAppTheme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const MIN_BIO_LENGTH = 20;
const MAX_BIO_LENGTH = 300;

export default function BioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);

  const { colors } = useAppTheme();

  const [bio, setBio] = useState("");

  const isValid = bio.trim().length >= MIN_BIO_LENGTH;
  const remaining = MAX_BIO_LENGTH - bio.trim().length;

  const handleNext = () => {
    router.push({
      pathname: "/(app)/onboarding/interests",
      params: { ...params, bio: bio.trim() },
    });
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAwareView>
          <View style={styles.content}>
            <QuestionHeader
              icon="create-outline"
              title="Write your bio"
              subtitle="Tell potential matches about yourself"
            />

            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.inputContainer}
            >
              <GlassTextArea
                placeholder="What makes you unique? Share your passions, hobbies, and what you're looking for..."
                value={bio}
                onChangeText={(text) => setBio(text.slice(0, MAX_BIO_LENGTH))}
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="next"
                onBlur={Keyboard.dismiss}
              />

              <View style={styles.counterContainer}>
                <Text
                  style={[
                    styles.counterText,
                    {
                      color:
                        remaining < 20 ? colors.error : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {remaining} characters remaining
                </Text>
                {!isValid && (
                  <Text
                    style={[
                      styles.hintText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Minimum {MIN_BIO_LENGTH} characters
                  </Text>
                )}
              </View>
            </Animated.View>
          </View>

          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.footer}
          >
            <GlassButton
              onPress={handleNext}
              label="Continue"
              disabled={!isValid}
            />
          </Animated.View>
        </KeyboardAwareView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  inputContainer: { flex: 1 },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  counterText: { fontSize: 14, fontWeight: "500" },
  hintText: { fontSize: 14 },
  footer: { padding: 24 },
});
