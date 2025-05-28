import express from 'express';
import { ProtectedRoute } from '../midleware/ProtectedRoute.js'; // Corrected middleware path
import {
    createBookingRequest,
    getBookingDetails,
    updateBookingStatus,
    getCarAvailability,
    addChatMessage,
    getUserBookings,
    getOwnerBookings
} from '../controllers/booking.controller.js';

const router = express.Router();

// Enable CORS for all routes
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://pfe-delta.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// POST /api/bookings/request - Create a new booking request (initiates chat)
router.post('/request', ProtectedRoute, createBookingRequest);

// GET /api/bookings/:bookingId - Get details of a specific booking
router.get('/:bookingId', ProtectedRoute, getBookingDetails);

// PUT /api/bookings/:bookingId/status - Update booking status (e.g., confirm, cancel)
router.put('/:bookingId/status', ProtectedRoute, updateBookingStatus);

// GET /api/bookings/availability/:carId - Check car availability for given dates
router.get('/availability/:carId', getCarAvailability); // Can be public or protected

// POST /api/bookings/:bookingId/chat - Add a message to the booking's chat
router.post('/:bookingId/chat', ProtectedRoute, addChatMessage);

// GET /api/bookings/user - Get all bookings for the logged-in renter
router.get('/user/my-bookings', ProtectedRoute, getUserBookings);

// GET /api/bookings/owner - Get all bookings for cars owned by the logged-in user
router.get('/owner/my-listings-bookings', ProtectedRoute, getOwnerBookings);

export default router;
