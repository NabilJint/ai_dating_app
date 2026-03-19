import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface PhotoIndicatorsProps {
  /**Total Number of photos */
  count: number;
  /**Current Displaying photo */
  currentIndex: number;

  /** Additional Styles */
  style?: ViewStyle;
}

export default function PhotoIndicators({
  count,
  currentIndex,
  style,
}: PhotoIndicatorsProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            {
              backgroundColor:
                index === currentIndex ? "#ffff" : "rgba(255,255,255,0.4)",
            },
          ]}
        ></View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
});
