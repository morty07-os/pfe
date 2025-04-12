import Car from '../models/car.models.js';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'; 

// Function to create a new car
export const createCar = async (req, res) => {
    try {
        // Extract car details from the request body
        const { make, model, year, pricePerDay, location, description, color, fuelType, seatingCapacity } = req.body;

        // Validate required fields
        if (!make || !model || !year || !pricePerDay || !location || !color || !fuelType || !seatingCapacity) {
            return res.status(400).send("Missing required fields: make, model, year, pricePerDay, location, color, fuelType, seatingCapacity");
        }

        // Create and save the new car
        const newCar = new Car({ 
            make, model, year, pricePerDay, location, description, color, fuelType, seatingCapacity, isDeleted: false 
        });
        await newCar.save();

        // Generate token and set it in the cookie
        generateTokenAndSetCookie(newCar._id, res);

        // Respond with car details
        res.status(201).json({
            _id: newCar._id,
            make: newCar.make,
            model: newCar.model,
            year: newCar.year,
            pricePerDay: newCar.pricePerDay,
            location: newCar.location,
            description: newCar.description,
            color: newCar.color,
            fuelType: newCar.fuelType,
            seatingCapacity: newCar.seatingCapacity,
            token: newCar.token,
        });
    } catch (error) {
        console.error("Error creating car:", error.message);
        res.status(500).json({ error: error.message || "Server error" });
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
        const { make, model, year, pricePerDay, location, description, color, fuelType, seatingCapacity } = req.body;

        // Update the car with the provided data
        const updatedCar = await Car.findByIdAndUpdate(
            id,
            { make, model, year, pricePerDay, location, description, color, fuelType, seatingCapacity },
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
