// Import required modules
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from './db/connectMONGODB.js'; 
import cookieParser from "cookie-parser";
import { ProtectedRoute } from "./midleware/ProtectedRoute.js";
import { errorHandler } from './midleware/errorHandler.js';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors"; // Import CORS
import User from './models/user.models.js'; // Import the User model
import path from "path"; // Import path
import carRoutes from "./routes/car.routes.js"; // Import car routes
import bookingRoutes from "./routes/booking.routes.js"; // Import booking routes


// Load environment variables
dotenv.config();

const app = express();
const PORT = 5002;

// Apply security headers using Helmet
app.use(helmet());

// Enable CORS for the frontend
app.use(cors({
    origin: "http://localhost:3000", // Ensure this matches the frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: true, // Allow cookies to be sent
}));

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin') }));

// Function to remove the username index if it exists
const removeUsernameIndex = async () => {
    try {
        const indexes = await User.collection.indexes();
        const usernameIndex = indexes.find(index => index.name === "username_1");
        if (usernameIndex) {
            await User.collection.dropIndex("username_1");
            console.log("Dropped username index successfully.");
        }
    } catch (error) {
        console.error("Error dropping username index:", error.message);
    }
};

// Mount authentication routes
app.use("/api/auth", authRoutes);

// Mount car routes
app.use("/api/cars", carRoutes);

// Mount booking routes
app.use("/api/bookings", bookingRoutes);


// Centralized error handling middleware
app.use(errorHandler);

// Start the server and connect to MongoDB
app.listen(PORT, async () => {
    console.log(`server is running on port: ${PORT}`);
    await connectMongoDB();
    await removeUsernameIndex(); // Ensure the username index is removed
});
