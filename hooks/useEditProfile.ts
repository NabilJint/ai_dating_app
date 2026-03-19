import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePhotoPicker } from "@/hooks/usePhotoPicker";
import {
  convertLookingForArray,
  convertLookingForToArray,
  MAX_INTERESTS,
} from "@/lib/constants";
import { calculateAgeFromDate, getDefaultDateOfBirth } from "@/lib/dateUtils";
import { hapticSelection, hapticSuccess } from "@/lib/haptics";
import { requestAndGetLocation, useReverseGeocode } from "@/lib/location";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

export interface PhotoEntry {
  uri: string;
  storageId?: string;
  isNew: boolean;
}

export function useEditProfile() {
  const { clerkUser } = useCurrentUser();

  // Raw profile query
  const profile = useQuery(
    api.users.getByClerkIdRaw,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip",
  );

  const updateProfile = useMutation(api.users.updateProfile);
  const { pickImage: pickImageFromLibrary, uploadPhoto } = usePhotoPicker();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Dating preferences
  const [dateOfBirth, setDateOfBirth] = useState<Date>(getDefaultDateOfBirth());
  const [gender, setGender] = useState<any>("woman");
  const [lookingFor, setLookingFor] = useState<any>("everyone");

  // Location
  const [distanceIndex, setDistanceIndex] = useState(1);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationInfoOverride, setLocationInfoOverride] = useState<any | null>(
    null,
  );
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const { locationInfo: geocodedInfo } = useReverseGeocode(
    locationInfoOverride ? null : location,
  );
  const locationInfo = locationInfoOverride || geocodedInfo;

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setInterests(profile.interests || []);
      setPhotos(profile.photos.map((p: string) => ({ uri: p, isNew: false })));
      if (profile.dateOfBirth) {
        setDateOfBirth(new Date(profile.dateOfBirth));
      } else if (profile.age) {
        const approxDateOfBirth = new Date();
        approxDateOfBirth.setFullYear(
          approxDateOfBirth.getFullYear() - profile.age,
        );
        setDateOfBirth(approxDateOfBirth);
      }
      if (profile.gender) {
        setGender(profile.gender);
      }
      if (profile.lookingFor) {
        setLookingFor(convertLookingForArray(profile.lookingFor));
      }
      setDistanceIndex(profile.maxDistance ? 0 : 1);
    }
  }, [profile]);

  const toggleInterest = (interest: string) => {
    hapticSelection();
    setInterests((prev) => {
      const newInterests = prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < MAX_INTERESTS
          ? [...prev, interest]
          : prev;
      return newInterests;
    });
  };

  const onPickImage = async () => {
    if (photos.length >= MAX_INTERESTS) return;
    const image = await pickImageFromLibrary();
    if (image) {
      setPhotos((p) => [...p, { uri: image, isNew: true }]);
    }
  };

  const removeImage = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profile?._id) return;

    setIsSaving(true);
    try {
      const photoIds = await Promise.all(
        photos.map(async (photo) => {
          if (photo.isNew) {
            return uploadPhoto(photo.uri);
          }
          return photo.uri;
        }),
      );

      await updateProfile({
        id: profile._id,
        name,
        bio,
        photos: photoIds,
        gender,
        lookingFor: convertLookingForToArray(lookingFor),
        interests,
        maxDistance: distanceIndex,
        ...(location && { location }),
        dateOfBirth: dateOfBirth.getTime(),
      });

      hapticSuccess();
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      const result = await requestAndGetLocation();
      setLocation(result.location);
      setLocationInfoOverride(result.locationInfo);
      hapticSuccess();
    } catch (error) {
      console.error("Failed to update location:", error);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const isValid =
    name.trim().length >= 2 &&
    bio.trim().length >= 10 &&
    interests.length >= 3 &&
    photos.length >= 1;

  const maxDistance = distanceIndex; // keep as index; UI maps to steps

  return {
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
    calculateAge: () => calculateAgeFromDate(dateOfBirth),
  } as const;
}

export default useEditProfile;
