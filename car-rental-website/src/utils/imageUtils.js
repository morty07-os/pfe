/**
 * Get the full image URL, handling both local and Cloudinary URLs
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL (Cloudinary or other CDN)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path (for backward compatibility)
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = process.env.REACT_APP_API_URL || '';
    return `${baseUrl}${imagePath}`;
  }
  
  // If it's a relative path without leading slash
  if (!imagePath.startsWith('/')) {
    return `/${imagePath}`;
  }
  
  return imagePath;
};

/**
 * Get multiple image URLs
 * @param {Array} images - Array of image paths
 * @returns {Array} - Array of full image URLs
 */
export const getImageUrls = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images.map(img => getImageUrl(img));
};

/**
 * Get the first image URL from an array of images
 * @param {Array} images - Array of image paths
 * @returns {string} - The first image URL or a placeholder if no images
 */
export const getFirstImage = (images = []) => {
  const imageUrls = getImageUrls(images);
  return imageUrls[0] || '/placeholder-car.png'; // Add a placeholder image in your public folder
};
