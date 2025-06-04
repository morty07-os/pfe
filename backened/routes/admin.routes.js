import express from 'express';
import { adminAuth } from '../midleware/adminAuth.js';
import { getPendingUsers, approveUser, rejectUser, updateCarStatusByAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

// Enable CORS for admin routes
router.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://pfe-delta.vercel.app',
        'https://pfe-morty07-os-projects.vercel.app',
        'https://pfe-git-main-morty07-os-projects.vercel.app'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Admin routes
router.get('/pending-users', adminAuth(), getPendingUsers);
router.post('/approve-user/:userId', adminAuth(), approveUser);
router.post('/reject-user/:userId', adminAuth(), rejectUser);

// Car management by admin
router.put('/cars/:carId/status', adminAuth(), updateCarStatusByAdmin);

export default router;
