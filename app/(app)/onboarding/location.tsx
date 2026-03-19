import { GlassButton } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { DISTANCE_STEPS, DistanceSlider } from "@/components/Preferences";
import { AdaptiveGlassView } from "@/lib/glass";
import { hapticButtonPress } from "@/lib/haptics";
import { useLocation } from "@/lib/location";
import { useAppTheme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function locationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);

  const { colors } = useAppTheme();

  const {
    isLoading,
    isGranted,
    location,
    locationInfo,
    errorMsg,
    permissionStatus,
    refreshLocation,
    requestPermision,
  } = useLocation();

  // store slider index (0 - 4)
  const [sliderIndex, setSliderIndex] = useState(1);
  //   const [isLoading, setIsLoading] = useState(false);
  //   const [locationGranted, setLocationGranted] = useState(false);
  //   const [locationCordd, setLocationCords] = useState<locationCoords | null>(
  //     null,
  //   );

  //   const [locationInfo, setLocationInfo] = useState<locationInfo | null>(null);

  const maxDistance = DISTANCE_STEPS[sliderIndex];

  const handleEnableLocation = async () => {
    hapticButtonPress();
    await requestPermision();
  };

  const handleContinue = () => {
    router.push({
      pathname: "/(app)/onboarding/bio",
      params: {
        ...params,
        ...(maxDistance != undefined && {
          maxDistance: maxDistance.toString(),
        }),
        ...(location && {
          longitude: location.longitude,
          latitude: location.latitude,
        }),
      },
    });
  };

  const handleSkip = () => {
    hapticButtonPress();
    router.push({
      pathname: "/(app)/onboarding/bio",
      params: {
        ...params,
        // Only pass maxDistance if it's not unlimited
        ...(maxDistance !== undefined && {
          maxDistance: maxDistance.toString(),
        }),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content]}>
        <QuestionHeader
          icon="location-outline"
          title="Enable location"
          subtitle="We use your location to show you people nearby"
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.locationContainer}
        >
          {/* Location Status */}
          <AdaptiveGlassView
            style={styles.statusCard}
            fallbackColor={
              isGranted ? colors.primaryContainer : colors.surfaceVariant
            }
          >
            <Text style={styles.statusEmoji}>{isGranted ? "✅" : "📍"}</Text>
            <View style={styles.statusTextContainer}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isGranted
                      ? colors.onPrimaryContainer
                      : colors.onSurfaceVariant,
                  },
                ]}
              >
                {isGranted ? "Location enabled" : "Location not yet enabled"}
              </Text>
              {isGranted && locationInfo?.displayName && (
                <Text
                  style={[
                    styles.locationName,
                    { color: colors.onPrimaryContainer },
                  ]}
                >
                  {locationInfo.displayName}
                </Text>
              )}
            </View>
          </AdaptiveGlassView>

          {/* Enable Location Button */}
          {!isGranted && (
            <TouchableOpacity
              style={[styles.enableButton, { backgroundColor: colors.primary }]}
              onPress={handleEnableLocation}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.enableButtonText}>
                {isLoading ? "Getting location..." : "Enable Location"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Distance Slider */}
          <View style={styles.sliderSection}>
            <DistanceSlider value={sliderIndex} onChange={setSliderIndex} />
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={styles.footer}
      >
        <GlassButton onPress={handleContinue} label="Continue" />
        {!isGranted && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  locationContainer: { gap: 24 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  statusEmoji: { fontSize: 24 },
  statusTextContainer: { flex: 1, gap: 2 },
  statusText: { fontSize: 16, fontWeight: "500" },
  locationName: { fontSize: 14, fontWeight: "600", opacity: 0.9 },
  enableButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
  },
  enableButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sliderSection: { marginTop: 8 },
  footer: { padding: 24, gap: 16 },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
