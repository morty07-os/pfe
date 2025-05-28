import express from 'express';
import {
    createFeedback,
    getFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
} from '../controllers/feedback.controller.js';
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
router.get('/', getFeedbacks);
router.get('/:id', getFeedbackById);

// Protected routes
router.post('/', ProtectedRoute(), createFeedback);
router.put('/:id', ProtectedRoute(), updateFeedback);
router.delete('/:id', ProtectedRoute(), deleteFeedback);

export default router;
