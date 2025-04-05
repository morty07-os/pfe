import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from './db/connectMONGODB.js'; 
import cookieParser from "cookie-parser";
import { ProtectedRoute } from "./midleware/ProtectedRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser ());
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
    connectMongoDB();
});