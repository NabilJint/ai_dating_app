import { hapticButtonPress } from "@/lib/haptics";
import { useAppTheme } from "@/lib/theme";
import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/** Distance steps: 10 , 25, 50, 100 unlimited(undefined) */
export const DISTANCE_STEPS: (number | undefined)[] = [
  10,
  25,
  50,
  100,
  undefined,
];

/** get distance in human readable format */
export const getDistanceLabel = (distance: number | undefined): string => {
  if (distance === undefined) return "Unlimited";
  return `${distance} miles`;
};

/** get the index of the given distance on the distance steps
 * @param distance the current distnace
 */
export const getDistanceIndex = (distance: number | undefined) => {
  if (distance === undefined) return DISTANCE_STEPS.length - 1;
  let index = DISTANCE_STEPS.indexOf(distance);

  // if index has no match get the closest index
  if (index === -1) {
    for (let i = 0; i <= DISTANCE_STEPS.length - 1; i++) {
      let currentIndex = DISTANCE_STEPS[i];

      if (currentIndex != undefined && distance <= currentIndex) {
        return i;
      }

      return DISTANCE_STEPS.length - 2;
    }
  }

  return index;
};

interface DistanceSliderProps {
  /** current distnace index (0 - 4)  */
  value: number;

  /** callback function when distnace changes */
  onChange: (index: number) => void;
}

/** A slider component for collecting maximum distance preference
 * Use predefined step 10, 25, 50, 100, unlimited
 */
export function DistanceSlider({ value, onChange }: DistanceSliderProps) {
  const maxDistance = DISTANCE_STEPS[value];
  const { colors } = useAppTheme();

  const handleChange = (newValue: number) => {
    const round = Math.round(newValue);
    if (value != round) {
      hapticButtonPress();
      onChange(round);
    }
  };
  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Maximum distance
        </Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {getDistanceLabel(maxDistance)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={DISTANCE_STEPS.length - 1}
        value={value}
        maximumTrackTintColor={colors.surfaceVariant}
        minimumTrackTintColor={colors.primary}
        onValueChange={handleChange}
        thumbTintColor={colors.primary}
        step={1}
      />
      <View style={styles.labels}>
        <Text style={[styles.endLabel, { color: colors.onSurfaceVariant }]}>
          10 mi
        </Text>
        <Text style={[styles.endLabel, { color: colors.onSurfaceVariant }]}>
          Unlimited
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  endLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
