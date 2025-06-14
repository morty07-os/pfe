import express from "express";
import multer from "multer";
import { login, signup, logout, getMe, refreshToken, verifyEmail, resendVerificationCode, forgotPassword, verifyResetCode, resetPassword, updateProfile, checkStatus } from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import { adminAuth } from "../midleware/adminAuth.js";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Enable CORS for specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://pfe-delta.vercel.app',
  'https://pfe-morty07-os-projects.vercel.app',
  'https://pfe-git-main-morty07-os-projects.vercel.app'
];

router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Auth routes
router.post('/login', login);
router.post('/signup', upload.single('profileImage'), signup);
router.post('/logout', logout);
router.get('/me', ProtectedRoute, getMe);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.put('/update-profile', ProtectedRoute, upload.single('profileImage'), updateProfile);
router.get('/check-status', checkStatus);

// Car routes
router.post("/addcars", ProtectedRoute, upload.array("images", 5), createCar); // Add a new car with image upload
router.get("/listcars", ProtectedRoute, getCars); // Get a list of cars
router.put("/updatecars/:id", ProtectedRoute, updateCar); // Update car details
router.delete("/deletecars/:id", ProtectedRoute, deleteCar); // Delete a car

// Admin routes (placeholder)
router.get("/admin/dashboard", ProtectedRoute(), adminAuth(), (req, res) => {
    res.status(200).json({ message: "Welcome to the admin dashboard!" });
});


// Payment route
//router.post("/payments", ProtectedRoute, processPayment); // Process a payment

export default router;
