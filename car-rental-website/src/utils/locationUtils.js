/**
 * Utility functions for location-related operations
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {Array} coord1 - First coordinate [latitude, longitude]
 * @param {Array} coord2 - Second coordinate [latitude, longitude]
 * @returns {Number} - Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {Number} deg - Degrees
 * @returns {Number} - Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

/**
 * Find the nearest wilaya to a given location
 * @param {Array} userLocation - User's location [latitude, longitude]
 * @param {Array} wilayasConfig - Array of wilaya objects with coordinates
 * @param {Number} maxDistance - Maximum distance in kilometers to consider a match
 * @returns {Object|null} - The nearest wilaya object or null if none found within maxDistance
 */
export const findNearestWilaya = (userLocation, wilayasConfig, maxDistance = 50) => {
  if (!userLocation || !wilayasConfig || wilayasConfig.length === 0) {
    return null;
  }
  
  // Debug log to see user's actual coordinates
  console.log('User location:', userLocation);
  
  // Calculate distances to all wilayas and sort them
  const wilayasWithDistances = wilayasConfig.map(wilaya => {
    const distance = calculateDistance(userLocation, wilaya.coordinates);
    return { ...wilaya, distance };
  }).sort((a, b) => a.distance - b.distance);
  
  // Log the closest wilayas for debugging
  console.log('Closest wilayas:', wilayasWithDistances.slice(0, 5).map(w => `${w.name}: ${w.distance.toFixed(2)}km`));
  
  // Get the nearest wilaya
  const nearestWilaya = wilayasWithDistances[0];
  
  // Only return the wilaya if it's within the maximum distance
  return nearestWilaya.distance <= maxDistance ? nearestWilaya : null;
};

/**
 * Find available pickup locations near a given location
 * @param {Array} userLocation - User's location [latitude, longitude]
 * @param {Object} pickupLocationsConfig - Object with pickup locations by wilaya
 * @param {Object} wilaya - The wilaya object
 * @param {Number} maxDistance - Maximum distance in kilometers to consider a location nearby
 * @returns {Array} - Array of nearby pickup locations
 */
export const findNearbyPickupLocations = (userLocation, pickupLocationsConfig, wilaya, maxDistance = 20) => {
  if (!userLocation || !pickupLocationsConfig || !wilaya || !pickupLocationsConfig[wilaya.name]) {
    return [];
  }
  
  const locations = pickupLocationsConfig[wilaya.name];
  
  return locations.filter(location => {
    const distance = calculateDistance(userLocation, location.position);
    return distance <= maxDistance;
  }).map(location => ({
    ...location,
    distance: Math.round(calculateDistance(userLocation, location.position) * 10) / 10 // Round to 1 decimal place
  })).sort((a, b) => a.distance - b.distance);
};
