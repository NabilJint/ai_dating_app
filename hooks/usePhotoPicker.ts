import { api } from "@/convex/_generated/api";
import { hapticButtonPress } from "@/lib/haptics";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";

interface UsePhotoPickerOption {
  maxPhotos?: number;
  aspect?: [number, number];
  quality?: number;
}

interface usePhotoPickerReturns {
  /** Pick an image from the local library and return null when cancelled */
  pickImage: () => Promise<string | null>;
  /** Upload a uri to a convex storage and return the storage ID */
  uploadPhoto: (uri: string) => Promise<string>;
  /**Uploads multiple images in parallel and return the strage IDs */
  uploadPhotos: (uri: string[]) => Promise<string[]>;
}

/**
 * Hook for picking and uploading photos to Convex Storage
 * Encapsulates permission handling, image picker and upload logic
 */

export const usePhotoPicker = (
  options: UsePhotoPickerOption = {},
): usePhotoPickerReturns => {
  const { maxPhotos = 6, aspect = [3, 4], quality = 0.8 } = options;

  const generateUploadUrl = useMutation(api.file.generateUploadUrl);

  const pickImage = useCallback(async (): Promise<string | null> => {
    const imagePermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!imagePermission.granted) {
      alert("Permission to access photos is required");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality,
    });

    if (!result.canceled && result.assets[0]) {
      hapticButtonPress();
      return result.assets[0].uri;
    }
    return null;
  }, [aspect, quality]);

  const uploadPhoto = useCallback(
    async (uri: string): Promise<string> => {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      const { storageId } = await uploadResponse.json();
      return storageId;
    },
    [generateUploadUrl],
  );
  const uploadPhotos = useCallback(
    async (uris: string[]): Promise<string[]> => {
      return Promise.all(uris.map(uploadPhoto));
    },
    [uploadPhoto],
  );

  return { pickImage, uploadPhoto, uploadPhotos };
};
