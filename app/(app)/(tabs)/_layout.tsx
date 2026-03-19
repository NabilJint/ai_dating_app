import { useAppTheme } from "@/lib/theme";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={colors.primary}
      labelStyle={
        {
          // color: DynamicColorIOS({
          //   dark: "white",
          //   light: "black",
          // }),
        }
      }
    >
      <NativeTabs.Trigger name="index">
        <Label>Discover</Label>
        <Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          drawable="custom_android_drawable"
          // md="favourite"
        />
      </NativeTabs.Trigger>

      {/* AI Suggested Matches */}
      <NativeTabs.Trigger name="matches">
        <Label>AI Matches</Label>
        <Icon sf="sparkles" />
      </NativeTabs.Trigger>

      {/* Chat / Messages */}
      <NativeTabs.Trigger name="chat">
        <Label>Chat</Label>
        <Icon
          sf={{ default: "message", selected: "message.fill" }}
          // md="chat"
        />
      </NativeTabs.Trigger>

      {/* Profile */}
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon
          sf={{ default: "person", selected: "person.fill" }}
          // md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
