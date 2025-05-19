import express from "express";
import { saveMessage, getMessages } from "../controllers/message.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";

const router = express.Router();

router.post("/save", ProtectedRoute(), saveMessage);
router.get("/:carId", ProtectedRoute({ required: false }), getMessages);

export default router;
