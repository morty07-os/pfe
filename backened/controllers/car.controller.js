import Car from '../models/car.models.js';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'; 

// Function to create a new car
export const createCar = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Uploaded files:", req.files); // Log uploaded files

        const { body, files } = req;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const images = files.map((file) => `uploads/${file.filename}`);

        const newCar = new Car({
            ...body,
            images,
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
