import express from 'express';
import { getPendingUsers, approveUser, rejectUser } from '../controllers/admin.controller.js';
import { adminAuth } from '../midleware/adminAuth.js'; // Assuming adminAuth middleware exists

const router = express.Router();

// Protect admin routes with admin authentication middleware
router.use(adminAuth);

// Route to get all pending users
router.get('/pending-users', getPendingUsers);

// Route to approve a user
router.put('/approve-user/:userId', approveUser);

// Route to reject a user
router.put('/reject-user/:userId', rejectUser);

export default router;
