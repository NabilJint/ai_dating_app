import {
  calculateAgeFromDate,
  getMaxDateOfBirth,
  getMinDateOfBirth,
} from "@/lib/dateUtils";
import { hapticSelection } from "@/lib/haptics";
import { useAppTheme } from "@/lib/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export { calculateAgeFromDate, getDefaultDateOfBirth } from "@/lib/dateUtils";

interface DateOfBirthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  showAgeCard?: boolean;
}

export function DateOfBirthPicker({
  value,
  onChange,
  showAgeCard = true,
}: DateOfBirthPickerProps) {
  const handleChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      hapticSelection();
      onChange(selectedDate);
    }
  };

  const age = calculateAgeFromDate(value);

  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      {showAgeCard && (
        <View
          style={[styles.ageCard, { backgroundColor: colors.primaryContainer }]}
        >
          <Text style={[styles.ageNumber, { color: colors.primary }]}>
            {age}
          </Text>
          <Text style={[styles.ageLabel, { color: colors.onPrimaryContainer }]}>
            years old
          </Text>
        </View>
      )}
      <View style={styles.datePickerWrapper}>
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          maximumDate={getMaxDateOfBirth()}
          minimumDate={getMinDateOfBirth()}
          themeVariant="light"
          style={styles.datePicker}
          accentColor={colors.background}
          textColor={colors.primary}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 24,
  },
  ageCard: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  ageNumber: {
    fontSize: 64,
    fontWeight: "800",
    letterSpacing: -2,
  },
  ageLabel: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: -4,
  },
  datePickerWrapper: {
    alignItems: "center",
    width: "100%",
  },
  datePicker: {
    height: 180,
    width: "100%",
  },
});
