import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const ProtectedRoute = (roles = []) => async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Not authorized: no token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Not authorized: invalid token" });
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user || (roles.length && !roles.includes(user.role))) {
            return res.status(403).json({ error: "Access denied" });
        }
        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired, please log in again" });
        }
        console.error("Error in ProtectedRoute middleware:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};