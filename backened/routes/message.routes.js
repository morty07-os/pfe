import express from "express";
import { saveMessage, getMessages, getConversations, getMessagesForUser } from "../controllers/message.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";

const router = express.Router();

router.get("/conversations", ProtectedRoute(), getConversations);
router.post("/save", ProtectedRoute(), saveMessage);
router.get("/:carId", ProtectedRoute({ required: false }), getMessages);
router.get("/user/:userId", ProtectedRoute(), getMessagesForUser);

export default router;
