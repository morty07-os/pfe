import Car from '../models/car.models.js';

// Function to create a new car
export const createCar = async (req, res) => {
    try {
        // Extract car details from the request body
        const { make, model, year, pricePerDay, location } = req.body;

        // Validate required fields
        if (!make || !model || !year || !pricePerDay || !location) {
            return res.status(400).send("Missing required fields: make, model, year, pricePerDay, location");
        }

        // Create and save the new car
        const newCar = new Car({ make, model, year, pricePerDay, location });
        await newCar.save();

        res.status(201).json(newCar);
    } catch (error) {
        console.error("Error creating car:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to fetch cars based on query parameters
export const getCars = async (req, res) => {
    try {
        // Extract query parameters
        const { location, minPrice, maxPrice, available } = req.query;
        const query = {};

        // Build the query object
        if (location) query.location = location;
        if (minPrice) query.pricePerDay = { $gte: minPrice };
        if (maxPrice) query.pricePerDay = { ...query.pricePerDay, $lte: maxPrice };
        if (available) query.availability = available === "true";

        // Fetch cars from the database
        const cars = await Car.find(query);
        res.status(200).json(cars);
    } catch (error) {
        console.error("Error fetching cars:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to update car details
export const updateCar = async (req, res) => {
    try {
        // Extract car ID from request parameters
        const { id } = req.params;
        const { make, model, year, pricePerDay, location } = req.body;

        // Update the car with the provided data
        const updatedCar = await Car.findByIdAndUpdate(
            id,
            { make, model, year, pricePerDay, location },
            { new: true } // Return the updated document
        );

        if (!updatedCar) {
            return res.status(404).send("Car not found");
        }

        res.status(200).json(updatedCar);
    } catch (error) {
        console.error("Error updating car:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to delete a car
export const deleteCar = async (req, res) => {
    try {
        // Extract car ID from request parameters
        const { id } = req.params;

        // Delete the car from the database
        const deletedCar = await Car.findByIdAndDelete(id);

        if (!deletedCar) {
            return res.status(404).send("Car not found");
        }

        res.status(200).send("Car deleted successfully");
    } catch (error) {
        console.error("Error deleting car:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
