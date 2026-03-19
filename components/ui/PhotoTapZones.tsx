import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface PhotoTapZonesProps {
  onTap: (side: "right" | "left") => void;
}

export default function PhotoTapZones({ onTap }: PhotoTapZonesProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.zone}
        activeOpacity={1}
        onPress={() => onTap("left")}
      />
      <TouchableOpacity
        style={styles.zone}
        activeOpacity={1}
        onPress={() => onTap("right")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  zone: {
    flex: 1,
  },
});
