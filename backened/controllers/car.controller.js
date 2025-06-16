import Car from "../models/car.models.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Configure Cloudinary (redundant if already in router, but included for completeness)
cloudinary.v2.config({
  cloud_name: "dtob4ibrg",
  api_key: "837972942685863",
  api_secret: "dVaH5ZDobVz2-R9NNZuIKXYCidY",
});

// Helper function to upload multiple images
const uploadImages = async (files) => {
  const imageUrls = [];
  if (files) {
    for (const file of files) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            { resource_type: "image", upload_preset: "unsigned_preset" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(file.buffer);
      });
      imageUrls.push(uploadResult.secure_url);
    }
  }
  return imageUrls;
};

// Create a new car
export const createCar = async (req, res) => {
  try {
    const { files } = req; // All files from multer

    const images = await uploadImages(files.images);
    const documentationImages = await uploadImages(files.documentationImages);

    // Parse features from JSON string if present, otherwise default to an empty object
    let features = {};
    console.log("Raw req.body.features for createCar:", req.body.features);
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
        console.log("Parsed features for createCar:", features);
      } catch (e) {
        console.error("Failed to parse features JSON:", e);
        features = {};
      }
    }

    const newCar = new Car({
      ...req.body,
      images,
      documentationImages,
      features, // Ensure features are included
    });
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (error) {
    console.error("Error creating car:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all cars with optional filters
export const getCars = async (req, res) => {
  try {
    const { brand, energy, minPrice, maxPrice, startDate, endDate } = req.query;
    let query = {};

    if (brand) query.brand = brand;
    if (energy) query.energy = energy;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    if (startDate && endDate) {
      query.availabilityStart = { $lte: new Date(endDate) };
      query.availabilityEnd = { $gte: new Date(startDate) };
    }

    const cars = await Car.find(query);
    res.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update a car
export const updateCar = async (req, res) => {
  try {
    const { files } = req; // All files from multer
    const updateData = { ...req.body };

    if (files && files.images && files.images.length > 0) {
      updateData.images = await uploadImages(files.images);
    }
    if (files && files.documentationImages && files.documentationImages.length > 0) {
      updateData.documentationImages = await uploadImages(files.documentationImages);
    }

    // Parse features from JSON string if present
    console.log("Raw req.body.features for updateCar:", req.body.features);
    if (req.body.features) {
      try {
        updateData.features = JSON.parse(req.body.features);
        console.log("Parsed features for updateCar:", updateData.features);
      } catch (e) {
        console.error("Failed to parse features JSON for update:", e);
        // Keep existing features or handle error as appropriate
      }
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(updatedCar);
  } catch (error) {
    console.error("Error updating car:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete a car
export const deleteCar = async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update car booking status
export const updateCarBookingStatus = async (req, res) => {
  try {
    const { carId } = req.params;
    const { bookingStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: 'Invalid car ID format.' });
    }

    const validStatuses = ['available', 'booked'];
    if (!bookingStatus || !validStatuses.includes(bookingStatus)) {
      return res.status(400).json({ message: 'Invalid or missing booking status.' });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    car.bookingStatus = bookingStatus;
    await car.save();

    res.status(200).json({ message: `Car booking status updated to ${bookingStatus}.`, car });
  } catch (error) {
    console.error("Error in updateCarBookingStatus:", error);
    res.status(500).json({ message: 'Failed to update car booking status.', error: error.message });
  }
};