import express from "express";
import multer from "multer";
import path from "path";
import { saveMessage, getMessages, getConversations, getMessagesForUser } from "../controllers/message.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";

const router = express.Router();

// Configure multer for message image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `message-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

router.get("/conversations", ProtectedRoute(), getConversations);
router.post("/save", ProtectedRoute(), upload.single("image"), saveMessage);
router.get("/:carId", ProtectedRoute({ required: false }), getMessages);
router.get("/user/:userId", ProtectedRoute(), getMessagesForUser);

export default router;
