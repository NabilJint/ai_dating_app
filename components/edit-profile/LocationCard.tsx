import { AdaptiveGlassView } from "@/lib/glass";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  location: { latitude: number; longitude: number } | null;
  locationInfo?: { displayName?: string } | null;
  isUpdating: boolean;
  onUpdate: () => void;
  colors: { primary: string; onBackground: string; onSurfaceVariant: string };
}

export default function LocationCard({
  location,
  locationInfo,
  isUpdating,
  onUpdate,
  colors,
}: Props) {
  return (
    <AdaptiveGlassView
      style={styles.locationCard}
      fallbackStyle={styles.inputFallback}
    >
      <View style={styles.locationStatus}>
        <View style={styles.locationInfoContainer}>
          <Ionicons
            name={location ? "location" : "location-outline"}
            size={24}
            color={location ? colors.primary : colors.onSurfaceVariant}
          />
          <View style={styles.locationTextContainer}>
            <Text
              style={[styles.locationLabel, { color: colors.onBackground }]}
            >
              {location ? "Location enabled" : "Location not set"}
            </Text>
            {location && locationInfo?.displayName && (
              <Text
                style={[
                  styles.locationCity,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {locationInfo.displayName}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.updateLocationButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onUpdate}
          disabled={isUpdating}
          activeOpacity={0.8}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateLocationText}>
              {location ? "Update" : "Enable"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </AdaptiveGlassView>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
  },
  inputFallback: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  locationTextContainer: { flex: 1 },
  locationLabel: { fontSize: 16, fontWeight: "500" },
  locationCity: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  updateLocationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  updateLocationText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
