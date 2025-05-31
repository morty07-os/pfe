import express from 'express';
import { getPendingUsers, approveUser, rejectUser } from '../controllers/admin.controller.js';
import { adminAuth } from '../midleware/adminAuth.js'; // Assuming admin auth middleware exists

const router = express.Router();

// Apply admin authentication middleware to all admin routes
router.use(adminAuth);

// GET /api/admin/pending-users - Get all users with status 'pending'
router.get('/pending-users', getPendingUsers);

// POST /api/admin/approve/:userId - Approve a user
router.post('/approve/:userId', approveUser);

// POST /api/admin/reject/:userId - Reject a user
router.post('/reject/:userId', rejectUser);

export default router;
