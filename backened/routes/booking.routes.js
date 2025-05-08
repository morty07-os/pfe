import express from 'express';
const router = express.Router();
import * as bookingController from '../controllers/booking.controller.js'; // Import all exports
import { ProtectedRoute } from '../midleware/ProtectedRoute.js'; // Import named export

// Middleware to check for admin role (placeholder)
const isAdmin = (req, res, next) => {
  // Assuming req.user is populated by protectedRoute and has a 'role' property
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // If req.user.role is not available or not admin, check if the user object itself has an isAdmin flag or similar
    // This is a fallback, ideally role should be clearly defined.
    // For now, let's assume a simple isAdmin flag on the user object for demonstration if 'role' isn't present.
    if (req.user && req.user.isAdmin) { 
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  }
};

// Create a new booking
router.post('/', ProtectedRoute(), bookingController.createBooking);

// Get all bookings for the authenticated user (as booker)
router.get('/mine', ProtectedRoute(), bookingController.getUserBookings);

// Get all bookings for cars owned by the authenticated user
router.get('/owner', ProtectedRoute(), bookingController.getOwnerBookings);

// Get a single booking by ID
// Add authorization within controller if needed (e.g. booker, owner, or admin)
router.get('/:bookingId', ProtectedRoute(), bookingController.getBookingById);

// Confirm a booking (Admin action)
// Applying isAdmin middleware after protectedRoute ensures req.user is available
router.patch('/:bookingId/confirm', ProtectedRoute(), isAdmin, bookingController.confirmBooking);

// Cancel a booking (User or Owner action)
router.patch('/:bookingId/cancel', ProtectedRoute(), bookingController.cancelBooking);

export default router;
