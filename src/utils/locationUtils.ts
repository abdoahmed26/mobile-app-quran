/**
 * Location Service Utilities
 * 
 * Helper functions for managing location permissions and retrieving user location
 */

import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Request location permission from the user
 * 
 * @returns Permission status
 */
export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return 'granted';
    } else if (status === 'denied') {
      return 'denied';
    } else {
      return 'undetermined';
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return 'denied';
  }
};

/**
 * Check current location permission status
 * 
 * @returns Permission status
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return 'granted';
    } else if (status === 'denied') {
      return 'denied';
    } else {
      return 'undetermined';
    }
  } catch (error) {
    console.error('Error checking location permission:', error);
    return 'denied';
  }
};

/**
 * Get the user's current location
 * 
 * @returns Location coordinates or null if unavailable
 */
export const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Request permission and get location in one call
 * 
 * @returns Location coordinates or null if permission denied or location unavailable
 */
export const getLocationWithPermission = async (): Promise<LocationCoordinates | null> => {
  const permission = await requestLocationPermission();
  
  if (permission !== 'granted') {
    return null;
  }

  return await getCurrentLocation();
};
