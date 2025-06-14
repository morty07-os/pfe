import express from 'express';
import dotenv from 'dotenv';
import connectMONGODB from './backened/db/connectMONGODB.js';
import authRoutes from './backened/routes/auth.routes.js';
import carRoutes from './backened/routes/car.routes.js';
import bookingRoutes from './backened/routes/booking.routes.js';
import messageRoutes from './backened/routes/message.routes.js';
import ratingRoutes from './backened/routes/rating.routes.js';
import feedbackRoutes from './backened/routes/feedback.routes.js';
import errorHandler from './backened/midleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectMONGODB();

// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000', // For local frontend development
    'https://pfe-delta.vercel.app', // Vercel production frontend
    'https://pfe-morty07-os-projects.vercel.app', // Specific Vercel production frontend from error
    /^\.*pfe-.*-morty07-os-projects\.vercel\.app$/, // Vercel preview deployments
    /^https?:\/\/pfe-.*\.vercel\.app$/, // Any Vercel preview URL
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []), // Additional frontend URLs from environment variable
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if the origin matches any of the allowed origins or patterns
        const isAllowed = allowedOrigins.some(pattern => {
            if (typeof pattern === 'string') {
                return pattern === origin;
            } else if (pattern instanceof RegExp) {
                return pattern.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/feedback', feedbackRoutes);

// Serve static files for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use(errorHandler);

// Export the app for Vercel
export default app;
