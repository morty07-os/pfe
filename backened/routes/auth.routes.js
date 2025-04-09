import express from "express";
import { login, signup , logout, getMe, refreshToken } from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
import { createBooking, getBookings, updateBooking, deleteBooking } from "../controllers/booking.controller.js";
import { processPayment } from "../controllers/payment.controller.js";

const router = express.Router();

// User routes
router.get("/me", ProtectedRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

// Car routes
router.post("/cars", ProtectedRoute, createCar);
router.get("/cars", ProtectedRoute, getCars);
router.put("/cars/:id", ProtectedRoute, updateCar);
router.delete("/cars/:id", ProtectedRoute, deleteCar);

// Booking routes
router.post("/bookings", ProtectedRoute, createBooking);
router.get("/bookings", ProtectedRoute, getBookings);
router.put("/bookings/:id", ProtectedRoute, updateBooking);
router.delete("/bookings/:id", ProtectedRoute, deleteBooking);

// Payment route
router.post("/payments", ProtectedRoute, processPayment);

export default router;
