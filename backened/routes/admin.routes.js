import express from 'express';
import { getPendingUsers, approveUser, rejectUser } from '../controllers/admin.controller.js';
import { adminAuth } from '../midleware/adminAuth.js'; // Assuming this is the correct admin auth middleware

const router = express.Router();

// Protect admin routes with adminAuth middleware
router.use(adminAuth);

// GET /api/admin/pending-users - Get all pending users
router.get('/pending-users', getPendingUsers);

// PUT /api/admin/approve-user/:userId - Approve a user
router.put('/approve-user/:userId', approveUser);

// PUT /api/admin/reject-user/:userId - Reject a user
router.put('/reject-user/:userId', rejectUser);

export default router;
