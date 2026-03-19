import {
  convertLookingForArray,
  convertLookingForToArray,
  LOOKING_FOR_OPTIONS,
  lookingForOptions,
} from "@/lib/constants/preferences";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassOption } from "../glass";

interface LookingForSelectorProps {
  /** Array format: ["woman"], ["man"], or ["woman", "man"] */
  value?: string[];
  /** Returns array format */
  onChange: (lookingFor: string[]) => void;
  animated?: boolean;
}

export  function LookingForSelector({
  value = [],
  onChange,
  animated = true,
}: LookingForSelectorProps) {
  //convert the value to string to display
  const selectedValue = convertLookingForArray(value);

  const onHandleChange = (option: lookingForOptions) => {
    onChange(convertLookingForToArray(option));
  };
  return (
    <View style={styles.container}>
      {LOOKING_FOR_OPTIONS.map((option, index) => {
        const optionComponent = (
          <GlassOption
            label={option.label}
            icon={option.icon}
            key={option.value}
            onPress={() => onHandleChange(option.value)}
            selected={selectedValue === option.value}
          />
        );

        if (animated) {
          return (
            <Animated.View
              key={option.value}
              entering={FadeInDown.delay(200 + index * 100).duration(500)}
            >
              {optionComponent}
            </Animated.View>
          );
        }

        return optionComponent;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
