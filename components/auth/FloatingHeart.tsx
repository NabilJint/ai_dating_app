import { SymbolView } from "expo-symbols";
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingHeartProps {
  size: number;
  top: number;
  left: number;
  delay: number;
  opacity: number;
}

const FloatingHeart = ({
  size,
  top,
  left,
  delay,
  opacity,
}: FloatingHeartProps) => {
  const translateY = useSharedValue(0);

  translateY.value = withRepeat(
    withSequence(
      withTiming(-10, { duration: 2000 }),
      withTiming(+10, { duration: 2000 }),
    ),
    -1,
    true,
  );

  const animateStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(1000)}
      style={[
        {
          top,
          left,
          opacity,
          position: "absolute",
        },
        animateStyle,
      ]}
    >
      <SymbolView name="heart.fill" size={size} tintColor="#ff6b6b" />
    </Animated.View>
  );
};

export default FloatingHeart;
