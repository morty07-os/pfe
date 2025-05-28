// Import required modules
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io'; // Import Server from socket.io
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from './db/connectMONGODB.js';
import cookieParser from "cookie-parser";
import { ProtectedRoute } from "./midleware/ProtectedRoute.js";
import { errorHandler } from './midleware/errorHandler.js';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import User from './models/user.models.js';
import path from "path";
import carRoutes from "./routes/car.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import messageRoutes from "./routes/message.routes.js";
import ratingRoutes from "./routes/rating.routes.js"; // Import rating routes
import feedbackRoutes from "./routes/feedback.routes.js"; // Import feedback routes


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://pfe-delta.vercel.app',
    'https://pfe-morty07-os-projects.vercel.app'
];

// Create HTTP server
const httpServer = createServer(app);

// Initialize socket.io with the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: 'https://pfe-delta.vercel.app',
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    },
});

// Apply security headers using Helmet with more permissive settings
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginEmbedderPolicy: false
}));

// Enable CORS for the frontend
app.use(cors({
    origin: ['https://pfe-delta.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie']
}));

// Handle preflight requests
app.options('*', cors({
    origin: ['https://pfe-delta.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Access-Control-Allow-Origin', 'https://pfe-delta.vercel.app');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}));

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
app.use("/api/messages", messageRoutes);
app.use("/api/ratings", ratingRoutes); // Mount rating routes
app.use("/api/feedbacks", feedbackRoutes); // Mount feedback routes


// Add a simple root route for health check or basic message
app.get('/', (req, res) => {
    res.status(200).send('Car Rental Backend API is running!');
});

// Centralized error handling middleware
app.use(errorHandler);

// Start the server and connect to MongoDB
httpServer.listen(PORT, async () => {
    console.log(`Server is running on port: ${PORT}`);
    await connectMongoDB();
    await removeUsernameIndex(); // Ensure the username index is removed
});
