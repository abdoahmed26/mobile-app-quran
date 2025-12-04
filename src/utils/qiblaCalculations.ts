/**
 * Qibla Direction Calculation Utilities
 * 
 * Calculates the direction to the Kaaba in Makkah from any location on Earth
 * using the Haversine formula and bearing calculations.
 */

// Kaaba coordinates in Makkah, Saudi Arabia
export const KAABA_COORDINATES = {
  latitude: 21.4225,
  longitude: 39.8262,
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 */
const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculate the bearing (direction) from one coordinate to another
 * 
 * @param lat1 - Starting latitude in degrees
 * @param lon1 - Starting longitude in degrees
 * @param lat2 - Destination latitude in degrees
 * @param lon2 - Destination longitude in degrees
 * @returns Bearing in degrees (0-360, where 0 is North)
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = (toDegrees(θ) + 360) % 360;

  return bearing;
};

/**
 * Calculate the Qibla direction from the user's current location
 * 
 * @param userLatitude - User's current latitude
 * @param userLongitude - User's current longitude
 * @returns Qibla direction in degrees (0-360, where 0 is North)
 */
export const calculateQiblaDirection = (
  userLatitude: number,
  userLongitude: number
): number => {
  return calculateBearing(
    userLatitude,
    userLongitude,
    KAABA_COORDINATES.latitude,
    KAABA_COORDINATES.longitude
  );
};

/**
 * Calculate the distance to Kaaba in kilometers
 * Uses the Haversine formula
 * 
 * @param userLatitude - User's current latitude
 * @param userLongitude - User's current longitude
 * @returns Distance in kilometers
 */
export const calculateDistanceToKaaba = (
  userLatitude: number,
  userLongitude: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const φ1 = toRadians(userLatitude);
  const φ2 = toRadians(KAABA_COORDINATES.latitude);
  const Δφ = toRadians(KAABA_COORDINATES.latitude - userLatitude);
  const Δλ = toRadians(KAABA_COORDINATES.longitude - userLongitude);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Normalize angle to 0-360 range
 */
export const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};
