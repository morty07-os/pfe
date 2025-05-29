import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtob4ibrg',
  api_key: process.env.CLOUDINARY_API_KEY || '837972942685863',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dVaH5ZDobVz2-R9NNZuIKXYCidY',
  secure: true
});

export const uploadToCloudinary = async (file) => {
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'car-rental', // Optional: Organize files in a folder
      resource_type: 'auto', // Automatically detect the file type
    });
    
    return {
      url: result.secure_url, // HTTPS URL of the uploaded file
      public_id: result.public_id, // ID that can be used to manage the file
      format: result.format // File format (jpg, png, etc.)
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};
