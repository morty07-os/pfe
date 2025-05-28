import express from 'express';
import {
    createFeedback,
    getFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
} from '../controllers/feedback.controller.js';
import { ProtectedRoute } from '../midleware/ProtectedRoute.js'; // Corrected import

const router = express.Router();

// Public routes (e.g., getting all feedbacks, or a specific one)
router.get('/', getFeedbacks);
router.get('/:id', getFeedbackById);

// Protected routes (e.g., creating, updating, deleting feedback)
router.post('/', ProtectedRoute(), createFeedback);
router.put('/:id', ProtectedRoute(), updateFeedback);
router.delete('/:id', ProtectedRoute(), deleteFeedback);

export default router;
