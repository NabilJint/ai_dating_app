import { GlassButton } from "@/components/glass";
import { QuestionHeader } from "@/components/onboarding";
import { usePhotoPicker } from "@/hooks/usePhotoPicker";
import { hapticButtonPress } from "@/lib/haptics";
import { useAppTheme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const MAX_PHOTOS = 6;

export default function PhotoScreen() {
  const router = useRouter();
    const params = useLocalSearchParams();
    console.log(params);
  const { colors } = useAppTheme();

  // Store local URIs for display
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    pickImage: pickImageFromLibrary,
    uploadPhoto,
    uploadPhotos,
  } = usePhotoPicker({ maxPhotos: MAX_PHOTOS });

  const handleImagePick = async () => {
    hapticButtonPress();
    if (photos.length >= MAX_PHOTOS) return;

    const uri = await pickImageFromLibrary();

    if (uri) {
      setPhotos((prev) => [...prev, uri]);
    }
  };

  async function removePhoto(index: number) {
    hapticButtonPress();

    setPhotos((prev) => prev.filter((photo, i) => i != index));
  }

  const isValid = photos.length >= 1;

  async function handleContinue() {
    if (!isValid) return;

    hapticButtonPress();
    setIsUploading(true);
    try {
    //   get storageId from uploading images
      const storageIds = await uploadPhotos(photos);

      router.push({
        pathname: "/(app)/onboarding/complete",
        params: { ...params, photos: JSON.stringify(storageIds) },
      });
    } catch (error) {
      console.error("Failed to upload photos:", error);
      alert("Failed to upload photos. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <QuestionHeader
          icon="camera-outline"
          title="Add your photos"
          subtitle={`Add at least 1 photo to continue. You can add up to ${MAX_PHOTOS}.`}
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.photosGrid}
        >
          {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
            const photo = photos[index];
            const isMain = index === 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.photoSlot,
                  isMain && styles.mainPhotoSlot,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.outline,
                  },
                ]}
                onPress={() => (photo ? removePhoto(index) : handleImagePick())}
                disabled={isUploading || (!photo && photos.length !== index)}
                activeOpacity={0.8}
              >
                {photo ? (
                  <>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <View
                      style={[
                        styles.removeButton,
                        { backgroundColor: colors.error },
                      ]}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.addPhotoContent}>
                    {index === photos.length ? (
                      <>
                        <Text
                          style={[styles.addIcon, { color: colors.primary }]}
                        >
                          +
                        </Text>
                        {isMain && (
                          <Text
                            style={[
                              styles.mainLabel,
                              { color: colors.onSurfaceVariant },
                            ]}
                          >
                            Main photo
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text style={[styles.addIcon, { color: colors.outline }]}>
                        +
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

      </View>
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.hint}
        >
          <Text style={[styles.hintText, { color: colors.onSurfaceVariant }]}>
            Tip: Profiles with multiple photos get more matches!
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.footer}
        >
          <GlassButton
            onPress={handleContinue}
            label={isUploading ? "Uploading..." : "Continue"}
            disabled={!isValid || isUploading}
          />
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  questionContainer: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 17, lineHeight: 24 },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoSlot: {
    width: "30%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  mainPhotoSlot: {
    width: "47%",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: -2,
  },
  addPhotoContent: {
    alignItems: "center",
    gap: 4,
  },
  addIcon: {
    fontSize: 32,
    fontWeight: "300",
  },
  mainLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  hint: {
    marginTop: 24,
    alignItems: "center",
  },
  hintText: {
    fontSize: 14,
    textAlign: "center",
  },
  footer: { padding: 24 },
});
