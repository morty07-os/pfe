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
router.post('/addcars', upload.array('images', 5), async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Uploaded files:", req.files); // Log uploaded files

        const { body, files } = req;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const imagePaths = files.map((file) => `uploads/${file.filename}`);

        const car = new Car({
            ...body,
            images: imagePaths,
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
        const cars = await Car.find({ isDeleted: false }).select('-__v'); // Fetch all cars that are not soft-deleted
        res.status(200).json(cars);
    } catch (error) {
        console.error("Error fetching cars:", error.message); // Log error
        res.status(500).json({ error: 'Failed to fetch cars.', details: error.message });
    }
});

export default router;
