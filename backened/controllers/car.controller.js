import Car from "../models/car.models.js";
import cloudinary from "cloudinary";

// Configure Cloudinary (redundant if already in router, but included for completeness)
cloudinary.v2.config({
  cloud_name: "dtob4ibrg",
  api_key: "837972942685863",
  api_secret: "dVaH5ZDobVz2-R9NNZuIKXYCidY",
});

// Create a new car
export const createCar = async (req, res) => {
  try {
    const { file } = req; // Single image from multer
    let imageUrl = null;

    if (file) {
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
      imageUrl = uploadResult.secure_url;
    }

    const newCar = new Car({
      ...req.body,
      images: imageUrl ? [imageUrl] : [],
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
    const { file } = req;
    let imageUrl = null;

    if (file) {
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
      imageUrl = uploadResult.secure_url;
    }

    const updateData = {
      ...req.body,
    };
    if (imageUrl) updateData.images = [imageUrl];

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