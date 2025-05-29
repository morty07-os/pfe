import express from "express";
import multer from "multer";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import Car from "../models/car.models.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpe?g|png|webp/;
        const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
        
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Images only (jpeg, jpg, png, webp)'));
        }
    }
});

// Helper function to delete old images when updating
const deleteOldImages = async (carId) => {
    try {
        const car = await Car.findById(carId);
        if (!car) return;
        
        // Delete old images from Cloudinary
        const deletePromises = car.images.map(async (imageUrl) => {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            return deleteFromCloudinary(`car-rental/${publicId}`);
        });
        
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting old images:', error);
    }
};

// Car routes
router.post("/add", ProtectedRoute(), upload.array("images", 5), async (req, res) => {
    try {
        const { files } = req;
        
        // Upload images to Cloudinary
        const uploadPromises = files.map(file => 
            uploadToCloudinary(file).finally(() => {
                // Clean up the temporary file
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting temp file:', err);
                });
            })
        );
        
        const uploadedImages = await Promise.all(uploadPromises);
        req.body.images = uploadedImages.map(img => img.url);
        
        // Call the original createCar controller
        await createCar(req, res);
    } catch (error) {
        console.error('Error adding car:', error);
        res.status(500).json({ error: 'Failed to add car', details: error.message });
    }
}); // Add a new car with image upload
router.get("/list", getCars); // Get a list of cars
router.put("/update/:id", ProtectedRoute(), upload.array("images", 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { files } = req;
        
        // If new images are uploaded, delete old ones and upload new ones
        if (files && files.length > 0) {
            await deleteOldImages(id);
            
            const uploadPromises = files.map(file => 
                uploadToCloudinary(file).finally(() => {
                    // Clean up the temporary file
                    fs.unlink(file.path, err => {
                        if (err) console.error('Error deleting temp file:', err);
                    });
                })
            );
            
            const uploadedImages = await Promise.all(uploadPromises);
            req.body.images = uploadedImages.map(img => img.url);
        }
        
        // Call the original updateCar controller
        await updateCar(req, res);
    } catch (error) {
        console.error('Error updating car:', error);
        res.status(500).json({ error: 'Failed to update car', details: error.message });
    }
}); // Update car details with image upload
router.delete("/delete/:id", ProtectedRoute(), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get car first to delete images
        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        // Delete images from Cloudinary
        const deletePromises = car.images.map(async (imageUrl) => {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            return deleteFromCloudinary(`car-rental/${publicId}`);
        });
        
        await Promise.all(deletePromises);
        
        // Now delete the car
        await Car.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ error: 'Failed to delete car', details: error.message });
    }
}); // Delete a car

// Route to post a car
router.post('/addcars', ProtectedRoute(), upload.array('images', 5), async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Uploaded files:", req.files); // Log uploaded files

        const { body, files } = req;
        const { carName, brand, wilaya, description, energy, seats, doors, transmission, mileage, engine, availabilityStart, availabilityEnd, price, carType } = body;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        // Upload images to Cloudinary
        const uploadPromises = files.map(file => 
            uploadToCloudinary(file).finally(() => {
                // Clean up the temporary file
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting temp file:', err);
                });
            })
        );
        
        const uploadedImages = await Promise.all(uploadPromises);
        const imagePaths = uploadedImages.map(img => img.url);

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
