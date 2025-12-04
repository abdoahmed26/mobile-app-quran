/**
 * useQiblaDirection Hook
 * 
 * Custom hook that combines location services and magnetometer data
 * to calculate and track the Qibla direction in real-time
 */

import { useState, useEffect } from 'react';
import { Magnetometer } from 'expo-sensors';
import { Platform } from 'react-native';
import { calculateQiblaDirection, normalizeAngle } from '../utils/qiblaCalculations';
import { getLocationWithPermission, LocationCoordinates } from '../utils/locationUtils';

export interface QiblaDirectionData {
  // The direction to Qibla relative to current device heading (0-360 degrees)
  qiblaDirection: number;
  // Current device heading from magnetometer (0-360 degrees, 0 = North)
  heading: number;
  // Qibla bearing from user's location (0-360 degrees, 0 = North)
  qiblaBearing: number;
  // User's current location
  location: LocationCoordinates | null;
  // Loading state
  loading: boolean;
  // Error message if any
  error: string | null;
  // Whether location permission was granted
  locationPermission: boolean;
  // Whether magnetometer sensor is available
  sensorAvailable: boolean;
}

/**
 * Hook to get real-time Qibla direction
 */
export const useQiblaDirection = (): QiblaDirectionData => {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(true);

  // Get user location and calculate Qibla bearing
  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        const userLocation = await getLocationWithPermission();

        if (!isMounted) return;

        if (!userLocation) {
          setError('تعذر الحصول على موقعك. يرجى التأكد من تفعيل خدمات الموقع والسماح بالوصول.');
          setLocationPermission(false);
          setLoading(false);
          return;
        }

        setLocation(userLocation);
        setLocationPermission(true);

        // Calculate Qibla bearing from user's location
        const bearing = calculateQiblaDirection(
          userLocation.latitude,
          userLocation.longitude
        );
        setQiblaBearing(bearing);

        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error initializing location:', err);
        setError('حدث خطأ أثناء تحديد موقعك');
        setLoading(false);
      }
    };

    initializeLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to magnetometer for device heading
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupMagnetometer = async () => {
      try {
        // Check if magnetometer is available
        const isAvailable = await Magnetometer.isAvailableAsync();
        
        if (!isAvailable) {
          setSensorAvailable(false);
          setError('جهازك لا يدعم البوصلة المغناطيسية');
          return;
        }

        setSensorAvailable(true);

        // Set update interval (in milliseconds)
        Magnetometer.setUpdateInterval(100); // Update 10 times per second

        // Subscribe to magnetometer updates
        subscription = Magnetometer.addListener((data) => {
          const { x, y } = data;
          
          // Calculate heading from magnetometer data
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          
          // Normalize to 0-360
          angle = normalizeAngle(angle);

          // On Android, we need to adjust the angle
          if (Platform.OS === 'android') {
            angle = normalizeAngle(360 - angle);
          }

          setHeading(angle);
        });
      } catch (err) {
        console.error('Error setting up magnetometer:', err);
        setSensorAvailable(false);
        setError('تعذر الوصول إلى البوصلة المغناطيسية');
      }
    };

    setupMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Calculate Qibla direction relative to current heading
  const qiblaDirection = normalizeAngle(qiblaBearing - heading);

  return {
    qiblaDirection,
    heading,
    qiblaBearing,
    location,
    loading,
    error,
    locationPermission,
    sensorAvailable,
  };
};
