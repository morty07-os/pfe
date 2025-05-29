import express from "express";
import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import Car from "../models/car.models.js";

const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'car-rental-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage });

// Car routes
router.post("/add", ProtectedRoute(), upload.array("images", 5), createCar);
router.get("/list", getCars);
router.put("/update/:id", ProtectedRoute(), upload.array("images", 5), updateCar);
router.delete("/delete/:id", ProtectedRoute(), deleteCar);

// Route to post a car
router.post('/addcars', ProtectedRoute(), upload.array('images', 5), async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Uploaded files:", req.files); // Log uploaded files

        const { body, files } = req;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        // Use Cloudinary URLs
        const imagePaths = files.map((file) => file.path);

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
        res.status(201).json({ message: 'Car created successfully', car });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create car', details: error.message });
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
            carType,
            location,
            seats,
            doors,
            priceMin,
            priceMax,
            availableFrom,
            availableTo,
            search // Add search parameter
        } = req.query;

        const query = { isDeleted: false };

        // Handle text search across multiple fields
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            query.$or = [
                { brand: searchRegex },
                { carName: searchRegex },
                { description: searchRegex },
                { wilaya: searchRegex },
                { carType: searchRegex },
                { engine: searchRegex }
            ];
        }

        if (brand) query.brand = brand;
        if (energy) query.energy = energy;
        if (transmission) query.transmission = transmission;
        if (wilaya) query.wilaya = wilaya;
        if (carType) query.carType = carType;
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

// Route to fetch cars owned by the current user
router.get('/user-cars', ProtectedRoute(), async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find all cars where the owner is the current user
        const userCars = await Car.find({ 
            owner: userId,
            isDeleted: false 
        }).sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json(userCars);
    } catch (error) {
        console.error("Error fetching user's cars:", error.message);
        res.status(500).json({ error: 'Failed to fetch your cars.', details: error.message });
    }
});

// Route to fetch car details by ID
router.get('/details/:id', ProtectedRoute({ required: false }), async (req, res) => {
    try {
        const { id } = req.params;
        const car = await Car.findById(id)
            .select('-__v')
            .populate('owner', 'firstName lastName email'); // Populate owner information with email
            
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        // Check if the car is available based on its availability dates
        const now = new Date();
        const isAvailable = !car.isDeleted && 
                           new Date(car.availabilityStart) <= now && 
                           new Date(car.availabilityEnd) >= now;

        // Add isAvailable property to the response
        const carResponse = car.toObject();
        carResponse.isAvailable = isAvailable;

        // Get user ID from request if authenticated
        const userId = req.user?.userId || null;
        
        // Check if the current user is the owner of the car
        carResponse.isOwner = userId && car.owner._id.toString() === userId.toString();

        res.status(200).json(carResponse);
    } catch (error) {
        console.error("Error fetching car details:", error.message);
        res.status(500).json({ error: 'Failed to fetch car details.', details: error.message });
    }
});

export default router;
