import express from 'express';
import { adminAuth } from '../midleware/adminAuth.js';
import { getPendingUsers, approveUser, rejectUser } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/pending-users', adminAuth(), getPendingUsers);
router.post('/approve-user/:userId', adminAuth(), approveUser);
router.post('/reject-user/:userId', adminAuth(), rejectUser);

export default router;
