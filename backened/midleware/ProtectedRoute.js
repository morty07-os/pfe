import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes and restrict access based on roles
export const ProtectedRoute = () => (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("No Authorization header provided"); // Debugging log
        return res.status(401).json({ error: "Not authorized: no token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        console.log("No token found in Authorization header"); // Debugging log
        return res.status(401).json({ error: "Not authorized: no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        console.log("Token verified successfully:", decoded); // Debugging log
        req.user = decoded; // Attach user info to the request
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message); // Debugging log
        res.status(401).json({ error: "Not authorized: invalid token" });
    }
};