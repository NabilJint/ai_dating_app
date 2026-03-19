import FieldInput from "@/components/edit-profile/FieldInput";
import InterestsGrid from "@/components/edit-profile/InterestsGrid";
import LocationCard from "@/components/edit-profile/LocationCard";
import PhotosGrid from "@/components/edit-profile/PhotosGrid";
import PreferencesBlock from "@/components/edit-profile/PreferencesBlock";
import SaveFooter from "@/components/edit-profile/SaveFooter";
import { GlassCloseButton, GlassHeader } from "@/components/glass";
import { DateOfBirthPicker, DistanceSlider } from "@/components/Preferences";
import { KeyboardAwareView } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useEditProfile from "@/hooks/useEditProfile";
import { INTEREST_NAMES, MAX_INTERESTS } from "@/lib/constants";
import { calculateAgeFromDate } from "@/lib/dateUtils";
import { hapticButtonPress } from "@/lib/haptics";
import { useAppTheme } from "@/lib/theme";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PhotoEntry {
  uri: string;
  storageId?: string;
  isNew: boolean;
}
export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { clerkUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const {
    profile,
    name,
    setName,
    bio,
    setBio,
    interests,
    toggleInterest,
    photos,
    onPickImage,
    removeImage,
    isSaving,
    dateOfBirth,
    setDateOfBirth,
    gender,
    setGender,
    lookingFor,
    setLookingFor,
    distanceIndex,
    setDistanceIndex,
    maxDistance,
    location,
    locationInfo,
    isUpdatingLocation,
    handleUpdateLocation,
    handleSave,
    isValid,
    calculateAge,
  } = useEditProfile();

  const handleCancel = () => {
    hapticButtonPress();
    router.back();
  };

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </>
    );
  }

  // Calculate header height for content inset
  const headerHeight = insets.top + 12 + 44 + 16; // top inset + padding + button height + bottom padding
  const footerHeight = 16 + 56 + insets.bottom + 16; // top padding + button height + bottom inset + extra

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAwareView style={styles.keyboardView}>
          {/* ScrollView - extends behind header and footer */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: headerHeight, paddingBottom: footerHeight },
            ]}
            contentInsetAdjustmentBehavior="never"
          >
            {/* Photos Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                PHOTOS
              </Text>
              <PhotosGrid
                photos={photos}
                onAdd={onPickImage}
                onRemove={removeImage}
                outlineColor={colors.outline}
              />
            </View>

            <View style={styles.section}>
              <FieldInput
                label="NAME"
                value={name}
                onChange={setName}
                placeholder="Your name"
                placeholderColor={colors.onSurfaceVariant}
                textColor={colors.onBackground}
              />
            </View>

            <View style={styles.section}>
              <FieldInput
                label="BIO"
                value={bio}
                onChange={setBio}
                placeholder="Tell people about yourself..."
                placeholderColor={colors.onSurfaceVariant}
                textColor={colors.onBackground}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Date of Birth Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                DATE OF BIRTH ({calculateAgeFromDate(dateOfBirth)} years old)
              </Text>
              <DateOfBirthPicker
                value={dateOfBirth}
                onChange={setDateOfBirth}
                showAgeCard={false}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                I AM A
              </Text>
              <PreferencesBlock
                gender={gender}
                setGender={setGender}
                lookingFor={lookingFor}
                setLookingFor={setLookingFor}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                INTERESTS ({interests.length}/{MAX_INTERESTS})
              </Text>
              <InterestsGrid
                interests={interests}
                allInterests={INTEREST_NAMES}
                toggleInterest={toggleInterest}
                colors={colors}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                LOCATION
              </Text>
              <LocationCard
                location={location}
                locationInfo={locationInfo}
                isUpdating={isUpdatingLocation}
                onUpdate={handleUpdateLocation}
                colors={colors}
              />
              <View style={styles.distanceSection}>
                <DistanceSlider
                  value={distanceIndex}
                  onChange={setDistanceIndex}
                />
              </View>
            </View>
          </ScrollView>

          {/* Header - Positioned absolutely */}
          <GlassHeader
            title="Edit Profile"
            leftContent={<GlassCloseButton onPress={handleCancel} />}
            centerTitle
          />

          <SaveFooter
            isValid={isValid}
            isSaving={isSaving}
            onSave={async () => {
              try {
                await handleSave();
                router.back();
              } catch (e) {
                alert("Failed to update profile");
              }
            }}
            insetBottom={insets.bottom + 16}
            backgroundColor={colors.background}
          />
        </KeyboardAwareView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  // Photos
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoSlot: {
    width: "30%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  addPhotoSlot: {
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
  },
  // Inputs
  inputContainer: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  inputFallback: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  input: {
    fontSize: 17,
    fontWeight: "500",
  },
  textAreaContainer: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  textArea: {
    fontSize: 17,
    fontWeight: "400",
    minHeight: 100,
    lineHeight: 24,
  },
  // Interests
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  interestChipSelected: {
    // Glass tint handles the color
  },
  interestChipFallback: {
    borderWidth: 1.5,
  },
  interestText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Preference options
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionHalf: {
    flex: 1,
  },
  optionsColumn: {
    gap: 12,
  },
  // Location
  locationCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
  },
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
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationCity: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  updateLocationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  updateLocationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  distanceSection: {
    marginTop: 8,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  footerFallback: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  saveButton: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#FF4458",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
});
