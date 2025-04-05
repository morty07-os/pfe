import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
export const ProtectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "not authorized : no Token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "not authorized: invalid Token" });
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "not authorized: user not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        console.log("error in protected ProtectedRoute midleware++", err.message);
        res.status(500).json({ error: "server error" });
    }
}