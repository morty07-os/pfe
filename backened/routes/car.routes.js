import express from "express";
import multer from "multer";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import Car from "../models/car.models.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files to the "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Car routes
router.post("/add", ProtectedRoute(), upload.array("images", 5), createCar); // Add a new car with image upload
router.get("/list", getCars); // Get a list of cars
router.put("/update/:id", ProtectedRoute(), upload.array("images", 5), updateCar); // Update car details with image upload
router.delete("/delete/:id", ProtectedRoute(), deleteCar); // Delete a car

// Route to post a car
router.post('/addcars', ProtectedRoute(), upload.array('images', 5), async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Uploaded files:", req.files); // Log uploaded files

        const { body, files } = req;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const imagePaths = files.map((file) => `uploads/${file.filename}`);

        // Get user information for owner details
        const User = (await import('../models/user.models.js')).default;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const car = new Car({
            ...body,
            images: imagePaths,
            owner: req.user.userId,
            ownerName: {
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

        await car.save();
        res.status(201).json({ message: 'Car posted successfully!', car });
    } catch (error) {
        console.error("Error posting car:", error.message); // Log error
        res.status(500).json({ error: 'Failed to post the car.', details: error.message });
    }
});

// Route to fetch all cars posted by users
router.get('/getcars', async (req, res) => {
    try {
        const {
            brand,
            energy,
            transmission,
            wilaya,
            location,
            seats,
            doors,
            priceMin,
            priceMax,
            availableFrom,
            availableTo
        } = req.query;

        const query = { isDeleted: false };

        if (brand) query.brand = brand;
        if (energy) query.energy = energy;
        if (transmission) query.transmission = transmission;
        if (wilaya) query.wilaya = wilaya;
        if (location) query.location = location;
        if (seats) query.seats = parseInt(seats);
        if (doors) query.doors = parseInt(doors);
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin) query.price.$gte = parseFloat(priceMin);
            if (priceMax) query.price.$lte = parseFloat(priceMax);
        }
        if (availableFrom || availableTo) {
            query.$and = [];
            if (availableFrom) {
                query.$and.push({ availabilityEnd: { $gte: new Date(availableFrom) } });
            }
            if (availableTo) {
                query.$and.push({ availabilityStart: { $lte: new Date(availableTo) } });
            }
        }

        // Fetch cars with owner information
        const cars = await Car.find(query)
            .select('-__v')
            .populate('owner', 'firstName lastName -_id'); // Populate owner information
            
        res.status(200).json(cars);
    } catch (error) {
        console.error("Error fetching cars:", error.message);
        res.status(500).json({ error: 'Failed to fetch cars.', details: error.message });
    }
});

// Route to fetch car details by ID
router.get('/details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const car = await Car.findById(id)
            .select('-__v')
            .populate('owner', 'firstName lastName -_id'); // Populate owner information
            
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json(car);
    } catch (error) {
        console.error("Error fetching car details:", error.message);
        res.status(500).json({ error: 'Failed to fetch car details.', details: error.message });
    }
});

export default router;