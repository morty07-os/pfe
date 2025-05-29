import express from "express";
import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import path from "path";
import { 
  saveMessage, 
  getMessages, 
  getConversations, 
  getMessagesForUser,
  getCarConversations 
} from "../controllers/message.controller.js"; 
import { ProtectedRoute } from "../midleware/ProtectedRoute.js"; 

const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'message-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage });

router.get("/conversations", ProtectedRoute(), getConversations);
router.post("/save", ProtectedRoute(), upload.single("image"), saveMessage);
router.get("/car-conversations/:carId", ProtectedRoute(), getCarConversations);
router.get("/:carId", ProtectedRoute({ required: false }), getMessages);
router.get("/user/:userId", ProtectedRoute(), getMessagesForUser);

export default router;
