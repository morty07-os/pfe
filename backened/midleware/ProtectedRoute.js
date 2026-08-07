import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes and restrict access based on roles
export const ProtectedRoute = (options = { required: true }) => async (req, res, next) => {
    let token = null;

    // 1. Try to get token from cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // 2. If not in cookie, try to get token from Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // If no token is found
    if (!token) {
        if (options.required) {
            return res.status(401).json({ error: "Not authorized: no token provided" });
        }
        // If authentication is not strictly required, proceed without user context
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request (e.g., { userId: '...' })

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Only check status for users with pending status
        if (user.status === 'pending') {
            return res.status(403).json({ 
                error: "Account pending approval",
                isPending: true 
            });
        }

        req.user = { userId: user._id, role: user.role };
        next();
    } catch (error) {
        // If token verification fails
        if (options.required) {
            console.error("Token verification failed:", error.message); // Log error for debugging
            return res.status(401).json({ error: "Not authorized: invalid or malformed token" });
        }
        // If authentication is not strictly required but token is invalid, proceed without user context
        // Optionally, clear the invalid cookie if it exists
        if (req.cookies && req.cookies.jwt) {
            res.clearCookie('jwt');
        }
        next();
    }
};
