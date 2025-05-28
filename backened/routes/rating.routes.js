import express from 'express';
import {
    createRating,
    getRatings,
    getRatingsByCarId,
    updateRating,
    deleteRating,
    getAverageRatingByCarId,
    getRatingsByRatedUserId, // Import new function
    getAverageRatingByRatedUserId, // Import new function
    getUserRatings,
    getAverageRating
} from '../controllers/rating.controller.js';
import { ProtectedRoute } from '../midleware/ProtectedRoute.js'; // Corrected import

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

router.get('/user/:userId', getUserRatings);
router.get('/average/user/:userId', getAverageRating);

export default router;
