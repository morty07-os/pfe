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

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Adjust as needed for your frontend
    credentials: true
}));
app.use(express.json()); // To parse JSON payloads
app.use(cookieParser());

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
