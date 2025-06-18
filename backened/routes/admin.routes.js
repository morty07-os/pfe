import express from 'express';
import multer from 'multer';
import path from 'path';
import { adminAuth } from '../midleware/adminAuth.js';
import { ProtectedRoute } from '../midleware/ProtectedRoute.js';
import { getPendingUsers, approveUser, rejectUser, sendReceipt, getPendingReceipts, approveReceipt, rejectReceipt } from '../controllers/admin.controller.js';

const router = express.Router();

// Configure multer for receipt image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

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
router.post('/send-receipt', ProtectedRoute(), upload.single('receipt'), sendReceipt);
router.get('/pending-receipts', adminAuth(), getPendingReceipts);
router.post('/approve-receipt/:receiptId', adminAuth(), approveReceipt);
router.post('/reject-receipt/:receiptId', adminAuth(), rejectReceipt);

export default router;
