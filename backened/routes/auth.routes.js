import express from "express";
import { login, signup, logout, getMe, refreshToken } from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
import { createBooking, getBookings, updateBooking, deleteBooking } from "../controllers/booking.controller.js";
import { processPayment } from "../controllers/payment.controller.js";

const router = express.Router();

// User routes
router.get("/me", ProtectedRoute, getMe); // Get details of the logged-in user
router.post("/signup", signup); // Register a new user
router.post("/login", login); // Log in a user
router.post("/logout", logout); // Log out a user
router.post("/refresh-token", refreshToken); // Refresh JWT token

// Car routes
router.post("/addcars", ProtectedRoute, createCar); // Add a new car
router.get("/listcars", ProtectedRoute, getCars); // Get a list of cars
router.put("/updatecars/:id", ProtectedRoute, updateCar); // Update car details
router.delete("/deletecars/:id", ProtectedRoute, deleteCar); // Delete a car

// Booking routes
router.post("/bookings", ProtectedRoute, createBooking); // Create a new booking
router.get("/bookings", ProtectedRoute, getBookings); // Get all bookings
router.put("/bookings/:id", ProtectedRoute, updateBooking); // Update a booking
router.delete("/bookings/:id", ProtectedRoute, deleteBooking); // Delete a booking

// Payment route
router.post("/payments", ProtectedRoute, processPayment); // Process a payment

export default router;
