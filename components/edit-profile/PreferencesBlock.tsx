import { GlassOption } from "@/components/glass";
import { GENDERS, LOOKING_FOR_OPTIONS } from "@/lib/constants";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  gender: string;
  setGender: (g: any) => void;
  lookingFor: string;
  setLookingFor: (v: any) => void;
}

export default function PreferencesBlock({
  gender,
  setGender,
  lookingFor,
  setLookingFor,
}: Props) {
  return (
    <>
      <View style={styles.optionsRow}>
        {GENDERS.map((g) => (
          <View key={g.value} style={styles.optionHalf}>
            <GlassOption
              icon={g.icon}
              label={g.label}
              onPress={() => setGender(g.value)}
              selected={gender === g.value}
            />
          </View>
        ))}
      </View>

      <View style={styles.optionsColumn}>
        {LOOKING_FOR_OPTIONS.map((option) => (
          <GlassOption
            key={option.value}
            icon={option.icon}
            label={option.label}
            onPress={() => setLookingFor(option.value)}
            selected={lookingFor === option.value}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  optionsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  optionHalf: { flex: 1 },
  optionsColumn: { gap: 12 },
});
