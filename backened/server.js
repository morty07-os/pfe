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
import fs from 'fs';
import carRoutes from "./routes/car.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import messageRoutes from "./routes/message.routes.js";
import ratingRoutes from "./routes/rating.routes.js"; // Import rating routes
import feedbackRoutes from "./routes/feedback.routes.js"; // Import feedback routes
import adminRoutes from "./routes/admin.routes.js"; // Import admin routes


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5001',
    'https://pfe-delta.vercel.app',
    'https://pfe-morty07-os-projects.vercel.app',
    'https://pfe-git-main-morty07-os-projects.vercel.app',
    'https://pfe-morty07.vercel.app'
];

// Create HTTP server
const httpServer = createServer(app);

// Initialize socket.io with the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
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

// Update CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'https://pfe-delta.vercel.app',
            'https://pfe-morty07-os-projects.vercel.app',
            'https://pfe-git-main-morty07-os-projects.vercel.app'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS not allowed'), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Ensure OPTIONS requests are handled properly
app.options('*', cors());

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
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, path, stat) => {
        // Security headers
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.set('Cross-Origin-Opener-Policy', 'unsafe-none');
        
        // Get the origin from the request
        const origin = res.req.headers.origin || '';
        
        // Check if the origin is in our allowed list
        if (allowedOrigins.some(allowedOrigin => origin.includes(allowedOrigin.replace(/^https?:\/\//, '')))) {
            res.set('Access-Control-Allow-Origin', origin);
        } else if (process.env.NODE_ENV === 'production') {
            // Default to the main production domain if origin not in allowed list
            res.set('Access-Control-Allow-Origin', 'https://pfe-delta.vercel.app');
        } else {
            // In development, allow any origin
            res.set('Access-Control-Allow-Origin', '*');
        }
        
        // CORS headers
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Allow-Credentials', 'true');
        
        // Caching headers (1 year for images)
        if (/\.(jpg|jpeg|png|gif|svg)$/i.test(path)) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
            res.set('Cache-Control', 'no-store');
        }
        
        // Add versioning to prevent caching issues during updates
        res.set('ETag', `${Date.now()}`);
    }
}));

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Mount other routes
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/admin", adminRoutes); // Mount admin routes

// Add a simple root route for health check
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
