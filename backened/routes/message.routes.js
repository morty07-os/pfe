import express from "express";
import multer from "multer";
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

// Enable CORS for all routes
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://pfe-delta.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

router.get("/conversations", ProtectedRoute(), getConversations);
router.post("/save", ProtectedRoute(), upload.single("image"), saveMessage);
router.get("/:conversationId", ProtectedRoute(), getMessages);
router.get("/user/:userId", ProtectedRoute(), getMessagesForUser);
router.get("/car/:carId", ProtectedRoute(), getCarConversations);

export default router;
