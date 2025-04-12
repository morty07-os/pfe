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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Apply security headers using Helmet
app.use(helmet());

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

// Mount authentication routes
app.use("/api/auth", authRoutes);

// Centralized error handling middleware
app.use(errorHandler);

// Start the server and connect to MongoDB
app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
    connectMongoDB();
});