import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

export const adminAuth = () => {
    return async (req, res, next) => {
        try {
            // Check for token in both cookie and Authorization header
            const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: "Unauthorized - No Token Provided" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded || !decoded.userId) {
                return res.status(401).json({ error: "Unauthorized - Invalid Token" });
            }

            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Check if the user has the 'admin' role
            if (user.role !== 'admin') {
                return res.status(403).json({ error: "Forbidden - Admin access required" });
            }

            req.user = user; // Attach user object to the request
            next();

        } catch (error) {
            console.error("Error in adminAuth middleware:", error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: "Unauthorized - Invalid Token" });
            }
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
};
