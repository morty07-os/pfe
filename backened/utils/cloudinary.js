import cloudinary from 'cloudinary';
import fs from 'fs'; // Import fs for file system operations

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload an image to Cloudinary
export const uploadImageToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'car-rental-app', // Optional: specify a folder in Cloudinary
    });
    // Delete the local file after successful upload
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    // Optionally delete the local file even if upload fails
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    return null;
  }
};

// Function to delete an image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    console.log("Cloudinary deletion result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return null;
  }
};

// Export the Cloudinary instance and the new functions
export { cloudinary };
