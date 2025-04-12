import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import jwt from 'jsonwebtoken';

// Handles user signup
export const signup = async (req, res) => {
    try {
        // Extract user details from the request body
        const { fullName, username, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validate email format
        if (!emailRegex.test(email.toLowerCase())) {
            return res.status(400).json({ error: "invalid email format" });
        }

        // Check if username or email already exists
        const exisitngUser = await User.findOne({ username });
        if (exisitngUser) {
            return res.status(400).json({ error: "username already taken" });
        }

        const exisitngEmail = await User.findOne({ email: email.toLowerCase() });
        if (exisitngEmail) {
            return res.status(400).json({ error: "email already taken" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: "password must be at least 6 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Create a new user
        const newUser = new User({
            fullName,
            username,
            email: email.toLowerCase(),
            password: hashpassword
        });

        // Save the user and generate a token
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                token: newUser.token,
            });
        } else {
            res.status(400).json({ error: "invalid user data" });
        }
    } catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({ error: "server error" });
    }
};

// Handles user login
export const login = async (req, res) => {
    try {
        // Extract username and password from the request body
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });

        // Validate user existence and password correctness
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "invalid username or password" });
        }

        // Generate token and set it in the cookie
        generateTokenAndSetCookie(user._id, res);

        // Respond with user details
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            token: user.token,
        });
    } catch (error) {
        console.log("error in login controller", error.message);
        res.status(500).json({ error: "server error" });
    }
};

// Handles user logout
export const logout = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "user logged out successfully" });
    } catch (error) {
        console.log("error in logout controller", error.message);
        res.status(500).json({ error: "server error" });
    }
};

// Fetches details of the logged-in user
export const getMe = async (req, res) => {
    try {
        // Find the user by ID and exclude the password field
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("error in getMe controller", error.message);
        res.status(500).json({ error: "server error" });
    }
};

// Refreshes the JWT token
export const refreshToken = async (req, res) => {
    try {
        // Retrieve the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token provided" });
        }

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Verify the refresh token and generate a new access token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });

        // Set the new token in the cookie
        res.cookie("jwt", newToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });

        res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        res.status(401).json({ error: "Invalid or expired refresh token" });
    }
};