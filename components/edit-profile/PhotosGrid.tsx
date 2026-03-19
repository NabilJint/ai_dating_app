import { PhotoItem } from "@/components/Profile";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  photos: { uri: string; isNew?: boolean }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  maxSlots?: number;
  outlineColor?: string;
}

export default function PhotosGrid({
  photos,
  onAdd,
  onRemove,
  maxSlots = 6,
  outlineColor = "#E1E1E1",
}: Props) {
  return (
    <View style={styles.photosGrid}>
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={index}
          style={styles.photoSlot}
          onPress={() => onRemove(index)}
          activeOpacity={0.9}
        >
          <PhotoItem storageId={photo.uri} style={styles.photoImage} />
        </TouchableOpacity>
      ))}

      {photos.length < maxSlots && (
        <TouchableOpacity
          style={[
            styles.photoSlot,
            styles.addPhotoSlot,
            { borderColor: outlineColor },
          ]}
          onPress={onAdd}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={32} color={outlineColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
