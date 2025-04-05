import express from "express";
import { login, signup , logout, getMe} from "../controllers/auth.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
const router = express.Router();
router.get("/me", ProtectedRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
export default router;
