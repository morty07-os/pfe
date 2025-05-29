import Car from '../models/car.models.js';
import User from '../models/user.models.js';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'; 
import cloudinary from 'cloudinary';
import fs from 'fs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtob4ibrg',
  api_key: process.env.CLOUDINARY_API_KEY || '837972942685863',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dVaH5ZDobVz2-R9NNZuIKXYCidY',
});

// Function to create a new car
export const createCar = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        console.log("Request body:", req.body); // Log request body
        console.log("Uploaded files:", req.files); // Log uploaded files

        const { body, files } = req;
        const { carName, brand, wilaya, description, energy, seats, doors, transmission, mileage, engine, availabilityStart, availabilityEnd, price, carType } = body;

        // Handle images from body (Cloudinary URLs from frontend)
        let images = body.images;
        if (typeof images === 'string') {
            images = [images];
        }
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        // Upload images to Cloudinary
        const cloudinaryImages = [];
        for (const file of files) {
            const result = await cloudinary.v2.uploader.upload(file.path, {
                folder: 'car_rental_cars',
                resource_type: 'image',
            });
            cloudinaryImages.push(result.secure_url);
            // Remove local file after upload
            fs.unlinkSync(file.path);
        }

        // Parse location if it's a string
        let locationData = body.location;
        if (typeof locationData === 'string') {
            try {
                locationData = JSON.parse(locationData);
            } catch (e) {
                console.error('Error parsing location:', e);
                return res.status(400).json({ error: 'Invalid location format' });
            }
        }

        // Create location object for GeoJSON
        const location = {
            type: 'Point',
            coordinates: [
                parseFloat(locationData.lng || locationData[0]),
                parseFloat(locationData.lat || locationData[1])
            ]
        };

        // Get user information for owner details
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newCar = new Car({
            carName,
            brand,
            wilaya,
            description,
            energy,
            seats,
            doors,
            transmission,
            mileage,
            engine,
            availabilityStart,
            availabilityEnd,
            price,
            carType,
            location,
            images: cloudinaryImages,
            owner: req.user.userId,
            ownerName: {
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

        await newCar.save();
        console.log("Car created successfully:", newCar); // Log success
        res.status(201).json({ message: 'Car created successfully', car: newCar });
    } catch (error) {
        console.error("Error creating car:", error.message); // Log error
        res.status(500).json({ error: 'Failed to create car', details: error.message });
    }
};

// Function to fetch cars based on query parameters
export const getCars = async (req, res) => {
    try {
        // Extract query parameters
        const { location, minPrice, maxPrice, available, page = 1, limit = 10 } = req.query;
        const query = { isDeleted: false };

        // Build the query object
        if (location) query.location = location;
        if (minPrice) query.pricePerDay = { $gte: minPrice };
        if (maxPrice) query.pricePerDay = { ...query.pricePerDay, $lte: maxPrice };
        if (available) query.availability = available === "true";

        // Pagination
        const skip = (page - 1) * limit;
        const cars = await Car.find(query).skip(skip).limit(parseInt(limit));
        const totalCars = await Car.countDocuments(query);

        res.status(200).json({ cars, totalCars, page: parseInt(page), totalPages: Math.ceil(totalCars / limit) });
    } catch (error) {
        console.error("Error fetching cars:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
};

// Function to update car details
export const updateCar = async (req, res) => {
    try {
        // Extract car ID from request parameters
        const { id } = req.params;
        const { make, model, year, pricePerDay, location, description, color, fuelType, seatingCapacity, images, doors, transmission, mileage, engine, availabilityStart, availabilityEnd } = req.body;

        // Update the car with the provided data
        const updatedCar = await Car.findByIdAndUpdate(
            id,
            { make, model, year, pricePerDay, location, description, color, fuelType, seatingCapacity, images, doors, transmission, mileage, engine, availabilityStart, availabilityEnd },
            { new: true } // Return the updated document
        );

        if (!updatedCar) {
            return res.status(404).json({ error: "Car not found" });
        }

        res.status(200).json(updatedCar);
    } catch (error) {
        console.error("Error updating car:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
};

// Function to delete a car (soft delete)
export const deleteCar = async (req, res) => {
    try {
        // Extract car ID from request parameters
        const { id } = req.params;

        // Soft delete the car by setting isDeleted to true
        const deletedCar = await Car.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

        if (!deletedCar) {
            return res.status(404).json({ error: "Car not found" });
        }

        res.status(200).send("Car deleted successfully");
    } catch (error) {
        console.error("Error deleting car:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
    }
};
