import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes and restrict access based on roles
export const ProtectedRoute = () => (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized: no token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message); // Log error for debugging
        return res.status(401).json({ error: "Not authorized: invalid or malformed token" });
    }
};