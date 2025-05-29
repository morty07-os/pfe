import express from "express";
import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import { login, signup, logout, getMe, refreshToken, verifyEmail, resendVerificationCode } from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";

//import { processPayment } from "../controllers/payment.controller.js";

const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'user-licences';
    if (file.fieldname === 'licenceFront') folder = 'user-licences/front';
    if (file.fieldname === 'licenceBack') folder = 'user-licences/back';
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});
const upload = multer({ storage });

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

// Car routes
router.post("/addcars", ProtectedRoute, upload.array("images", 5), createCar); // Add a new car with image upload
router.get("/listcars", ProtectedRoute, getCars); // Get a list of cars
router.put("/updatecars/:id", ProtectedRoute, updateCar); // Update car details
router.delete("/deletecars/:id", ProtectedRoute, deleteCar); // Delete a car



// Payment route
//router.post("/payments", ProtectedRoute, processPayment); // Process a payment

export default router;
