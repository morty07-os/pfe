import express from "express";
import multer from "multer";
import { login, signup, logout, getMe, refreshToken, verifyEmail, resendVerificationCode, forgotPassword, verifyResetCode, resetPassword, updateProfile } from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import { adminAuth } from "../midleware/adminAuth.js"; // Import adminAuth middleware
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";

//import { processPayment } from "../controllers/payment.controller.js";

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

// User routes
router.get("/me", ProtectedRoute(), getMe);
router.get("/profile", ProtectedRoute(), getMe);
router.put("/profile", ProtectedRoute(), upload.fields([
  { name: "licenceFront", maxCount: 1 },
  { name: "licenceBack", maxCount: 1 }
]), updateProfile); // New route for profile updates
router.post("/signup",
  upload.fields([
    { name: "licenceFront", maxCount: 1 }, 
    { name: "licenceBack", maxCount: 1 }
  ]), 
  signup
);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-code", resendVerificationCode);

// Forgot Password routes
router.post("/forgot-password", forgotPassword); // New route to request reset code
router.post("/verify-reset-code", verifyResetCode); // New route to verify reset code
router.post("/reset-password", resetPassword); // New route to reset password

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
