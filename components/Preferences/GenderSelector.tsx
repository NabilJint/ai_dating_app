import { GENDERS, type gender } from "@/lib/constants/preferences";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassOption } from "../glass";

interface GenderSelectorProp {
  /** Selected Gender */
  Gender?: gender;

  /** Callback function to update gender */
  onChange: (gender: gender) => void;

  animated?: boolean;
}

export  function GenderSelector({
  Gender,
  onChange,
  animated = true,
}: GenderSelectorProp) {
  return (
    <View style={styles.container}>
      {GENDERS.map((gender, index) => {
        const option = (
          <GlassOption
            key={gender.value}
            icon={gender.icon}
            label={gender.label}
            onPress={() => onChange(gender.value)}
            selected={Gender === gender.value}
          />
        );

        if (animated) {
          return (
            <Animated.View
              key={gender.value}
              entering={FadeInDown.delay(200 + index * 100).duration(500)}
            >
              {option}
            </Animated.View>
          );
        }
        return option;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
