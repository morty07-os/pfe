import express from 'express';
import {
    createRating,
    getRatings,
    getRatingsByCarId,
    updateRating,
    deleteRating,
    getAverageRatingByCarId,
    getRatingsByRatedUserId,
    getAverageRatingByRatedUserId
} from '../controllers/rating.controller.js';
import { ProtectedRoute } from '../midleware/ProtectedRoute.js';

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

// Public routes
router.get('/car/:carId', getRatingsByCarId);
router.get('/average/car/:carId', getAverageRatingByCarId);
router.get('/user/:userId', getRatingsByRatedUserId);
router.get('/average/user/:userId', getAverageRatingByRatedUserId);
router.get('/', getRatings);

// Protected routes
router.post('/', ProtectedRoute(), createRating);
router.put('/:id', ProtectedRoute(), updateRating);
router.delete('/:id', ProtectedRoute(), deleteRating);

export default router;
