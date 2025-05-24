import express from 'express';
import {
    createRating,
    getRatings,
    getRatingsByCarId,
    updateRating,
    deleteRating,
    getAverageRatingByCarId,
    getRatingsByRatedUserId, // Import new function
    getAverageRatingByRatedUserId // Import new function
} from '../controllers/rating.controller.js';
import { ProtectedRoute } from '../midleware/ProtectedRoute.js'; // Corrected import

const router = express.Router();

// Public routes (e.g., getting ratings for a car or user)
router.get('/car/:carId', getRatingsByCarId);
router.get('/average/car/:carId', getAverageRatingByCarId); // Corrected path for average car rating
router.get('/user/:userId', getRatingsByRatedUserId); // New route for user ratings
router.get('/average/user/:userId', getAverageRatingByRatedUserId); // New route for average user rating
router.get('/', getRatings); // Get all ratings (might be admin-only later)

// Protected routes (e.g., creating, updating, deleting a rating)
router.post('/', ProtectedRoute(), createRating);
router.put('/:id', ProtectedRoute(), updateRating);
router.delete('/:id', ProtectedRoute(), deleteRating);

export default router;
