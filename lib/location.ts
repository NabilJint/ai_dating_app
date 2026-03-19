import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

export interface locationCoords {
  latitude: number;
  longitude: number;
}

export interface locationInfo {
  region: string | null;
  city: string | null;
  country: string | null;
  displayName: string; // Formatted display string (e.g., "San Francisco, CA")
}

export interface locationState {
  location: locationCoords | null;
  errorMsg: string | null;
  isLoading: boolean;
  permissionStatus: Location.PermissionStatus | null;
}

/**
 * Request foreground location permission
 * @returns Permission status
 */
export const requestLocationPermission =
  async (): Promise<Location.PermissionStatus> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  };

/** Checks for location permission status
 * @returns Permission status
 */

export const getLocationStatus =
  async (): Promise<Location.PermissionStatus> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  };

/** Get current location coordinates
 * @returns the current location coordinate or null if not existing
 */

export const getLocationCoords = async (): Promise<locationCoords | null> => {
  try {
    const status = await getLocationStatus();

    if (status !== "granted") {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    };
  } catch (error) {
    console.error("Error getting location", error);
    return null;
  }
};

/** Get region code for common countries */
export const getRegionCode = (
  region: string,
  country: string | null,
): string => {
  if (country === "United State" || country === "USA" || country === "US") {
    const stateAbbreviations: Record<string, string> = {
      Alabama: "AL",
      Alaska: "AK",
      Arizona: "AZ",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      Delaware: "DE",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
      "District of Columbia": "DC",
    };

    return stateAbbreviations[region];
  }

  return region;
};

/**
 * Reverse geolocation to get region/city information
 * @param coords Location coordintes
 * @returns location info - region, country, city,display name
 */

async function reverseGeoLocation(
  coords: locationCoords,
): Promise<locationInfo> {
  try {
    const results = await Location.reverseGeocodeAsync({
      longitude: coords.longitude,
      latitude: coords.latitude,
    });

    if (results.length > 0) {
      let result = results[0];
      let city = result.city;
      let region = result.region;
      let country = result.country;

      // build the display name
      let displayName = "";

      if (city) {
        displayName = city;
        // Use region code if available (e.g CA instead of California)

        if (region) {
          const regionCode = getRegionCode(region, country);
          displayName += ` ,${regionCode}`;
        }
      } else if (region) {
        displayName = region;
        if (country) {
          displayName += ` ,${country}`;
        }
      } else if (country) {
        displayName = country;
      } else {
        displayName = " Unknown Location";
      }
      return { region, city, country, displayName };
    }

    return {
      region: null,
      city: null,
      country: null,
      displayName: "Unknow Location",
    };
  } catch (error) {
    console.error("Error getting geolocation info", error);
    return {
      region: null,
      city: null,
      country: null,
      displayName: "Unknow Location",
    };
  }
}

/** Request location and get location in one call
 * @returns location, location info, error if any and permission status
 */

export const requestAndGetLocation = async (): Promise<{
  location: locationCoords | null;
  locationInfo: locationInfo | null;
  error: string | null;
  status: Location.PermissionStatus;
}> => {
  try {
    const status = await requestLocationPermission();
    if (status != "granted") {
      return {
        location: null,
        locationInfo: null,
        error: "Permission Denied",
        status,
      };
    }

    const location = await getLocationCoords();

    const locationInfo = await reverseGeoLocation(location!);

    return {
      location,
      locationInfo,
      status,
      error: null,
    };
  } catch (error) {
    console.error("Error getting location", error);
    return {
      location: null,
      locationInfo: null,
      error: "Permission Denied",
      status: "denied" as Location.PermissionStatus,
    };
  }
};

export interface ExtendedLocationState extends locationState {
  locationInfo: locationInfo | null;
}

/**
 * Hook for accessing location with permission handling
 */

export const useLocation = () => {
  const [state, setState] = useState<ExtendedLocationState>({
    location: null,
    locationInfo: null,
    permissionStatus: "denied" as Location.PermissionStatus,
    errorMsg: null,
    isLoading: false,
  });

  // check location status on the mount
  useEffect(() => {
    async () => {
      const status = await getLocationStatus();
      setState((prev) => ({ ...prev, permissionStatus: status }));
    };
  }, []);

  // request permission status and set location
  const requestPermision = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await requestAndGetLocation();

      const { location, locationInfo, status, error } = result;

      setState((prev) => ({
        ...prev,
        location,
        locationInfo,
        permissionStatus: status,
        isLoading: false,
        errorMsg: error,
      }));

      return result;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unable to get location";
      setState((prev) => ({
        ...prev,
        errorMsg,
        isLoading: false,
      }));
      return {
        location: null,
        locationInfo: null,
        status: "denied" as Location.PermissionStatus,
        error: errorMsg,
      };
    }
  }, []);

  // Refresh the location
  const refreshLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const newLocation = await requestAndGetLocation();

    const { location, locationInfo, error } = newLocation;

    setState((prev) => ({
      ...prev,
      location,
      locationInfo,
      isLoading: false,
      errorMsg: error,
    }));

    return { location, locationInfo };
  }, []);

  return {
    ...state,
    refreshLocation,
    requestPermision,
    isGranted: state.permissionStatus === "granted",
  };
};

/**
 * Hook to reverse the geolocation
 * @param location Location coordinates to reverse geocode
 * @returns Location info state
 */

export const useReverseGeocode =  (
  location: locationCoords | null | undefined,
) => {
  const [locationInfo, setLocationInfo] = useState<locationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!location) {
      setLocationInfo(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    reverseGeoLocation(location!).then((info) => {
      setLocationInfo(info);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  return { locationInfo, isLoading };
};
