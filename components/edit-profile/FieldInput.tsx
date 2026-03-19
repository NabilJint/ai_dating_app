import { AdaptiveGlassView } from "@/lib/glass";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  placeholderColor?: string;
  textColor?: string;
}

export default function FieldInput({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  numberOfLines = 1,
  placeholderColor = "#999",
  textColor = "#000",
}: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AdaptiveGlassView
        style={multiline ? styles.textAreaContainer : styles.inputContainer}
        fallbackStyle={styles.inputFallback}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[
            multiline ? styles.textArea : styles.input,
            { color: textColor },
          ]}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </AdaptiveGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  textAreaContainer: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  inputFallback: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  input: { fontSize: 17, fontWeight: "500" },
  textArea: { fontSize: 17, fontWeight: "400", minHeight: 100, lineHeight: 24 },
});
