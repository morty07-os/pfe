import Car from '../models/car.models.js';

// Create a new car
export const createCar = async (req, res) => {
    try {
        const newCar = new Car({
            ...req.body,
            image: req.file ? req.file.path : null
        });
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (error) {
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
        
        // Add date availability filtering if dates are provided
        if (startDate && endDate) {
            query.availability = {
                $not: {
                    $elemMatch: {
                        startDate: { $lte: new Date(endDate) },
                        endDate: { $gte: new Date(startDate) }
                    }
                }
            };
        }

        const cars = await Car.find(query);
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a car
export const updateCar = async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            { ...req.body, ...(req.file && { image: req.file.path }) },
            { new: true }
        );
        if (!updatedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(updatedCar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a car
export const deleteCar = async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};