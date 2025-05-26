import express from "express";
import multer from "multer";
import { login, signup, logout, getMe, refreshToken, sendVerificationCode, verifyCode } from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
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
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
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
router.post("/send-verification-code", sendVerificationCode);
router.post("/verify-code", verifyCode);

// Car routes
router.post("/addcars", ProtectedRoute, upload.array("images", 5), createCar); // Add a new car with image upload
router.get("/listcars", ProtectedRoute, getCars); // Get a list of cars
router.put("/updatecars/:id", ProtectedRoute, updateCar); // Update car details
router.delete("/deletecars/:id", ProtectedRoute, deleteCar); // Delete a car



// Payment route
//router.post("/payments", ProtectedRoute, processPayment); // Process a payment

export default router;
