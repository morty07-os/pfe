import express from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import Car from "../models/car.models.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Configure multer for file uploads (in-memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Car routes
router.post("/add", ProtectedRoute(), upload.array("images", 5), createCar); // Add a new car with image upload
router.get("/list", getCars); // Get a list of cars
router.put("/update/:id", ProtectedRoute(), upload.array("images", 5), updateCar); // Update car details with image upload
router.delete("/delete/:id", ProtectedRoute(), deleteCar); // Delete a car

// Helper function to upload files to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'car-rental',
        upload_preset: 'unsigned_preset',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    
    uploadStream.end(file.buffer);
  });
};

// Route to post a car
router.post('/addcars', ProtectedRoute(), upload.array('images', 5), async (req, res) => {
    try {
        const { body, files } = req;
        const { carName, brand, wilaya, description, energy, seats, doors, transmission, mileage, engine, availabilityStart, availabilityEnd, price, carType } = body;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        // Upload all images to Cloudinary
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        const imageUrls = await Promise.all(uploadPromises);

        // Get user information for owner details
        const User = (await import('../models/user.models.js')).default;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const car = new Car({
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
            images: imageUrls, // Store Cloudinary URLs
            owner: req.user.userId,
            ownerName: {
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

        await car.save();
        res.status(201).json({ 
            message: 'Car posted successfully!', 
            car: {
                ...car.toObject(),
                images: imageUrls
            } 
        });
    } catch (error) {
        console.error("Error posting car:", error);
        res.status(500).json({ 
            error: 'Failed to post the car.', 
            details: error.message 
        });
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
