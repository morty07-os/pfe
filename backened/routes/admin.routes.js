import express from 'express';
import {
    getPendingUsers,
    verifyUser,
    rejectUser,
    getPendingCars,
    approveCar,
    rejectCar,
    getPendingBookings,
    approveBooking,
    rejectBooking
} from '../controllers/admin.controller.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Protect all admin routes with adminAuth middleware
router.use(adminAuth);

// User management routes
router.get('/users/pending', getPendingUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/reject', rejectUser);

// Car management routes
router.get('/cars/pending', getPendingCars);
router.put('/cars/:id/approve', approveCar);
router.put('/cars/:id/reject', rejectCar);

// Booking management routes
router.get('/bookings/pending', getPendingBookings);
router.put('/bookings/:id/approve', approveBooking);
router.put('/bookings/:id/reject', rejectBooking);

export default router;
