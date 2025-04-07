import Car from '../models/car.models.js';

export const createCar = async (req, res) => {
    try {
        const { make, model, year, pricePerDay, location } = req.body;
        if (!make || !model || !year || !pricePerDay || !location) {
            return res.status(400).send("Missing required fields: make, model, year, pricePerDay, location");
        }
        const newCar = new Car({ make, model, year, pricePerDay, location });
        await newCar.save();
        res.status(201).json(newCar);
    } catch (error) {
        console.error("Error creating car:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

export const getCars = async (req, res) => {
    try {
        const { location, minPrice, maxPrice, available } = req.query;
        const query = {};
        if (location) query.location = location;
        if (minPrice) query.pricePerDay = { $gte: minPrice };
        if (maxPrice) query.pricePerDay = { ...query.pricePerDay, $lte: maxPrice };
        if (available) query.availability = available === "true";

        const cars = await Car.find(query);
        res.status(200).json(cars);
    } catch (error) {
        console.error("Error fetching cars:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateCar = async (req, res) => {
    try {
        const { id } = req.params;
        const { make, model, year, pricePerDay, location } = req.body;
        const updatedCar = await Car.findByIdAndUpdate(
            id,
            { make, model, year, pricePerDay, location },
            { new: true }
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

export const deleteCar = async (req, res) => {
    try {
        const { id } = req.params;
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
