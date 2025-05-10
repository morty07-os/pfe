import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import jwt from 'jsonwebtoken';

// Handles user signup
export const signup = async (req, res) => {
    try {
        console.log("Signup request body:", req.body); // Log the request body

        const { firstName, lastName, birthDate, phone, residence, email, password } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Validate required fields
        if (!req.files || !req.files.licenceFront || !req.files.licenceBack) {
            return res.status(400).json({ error: "Driving licence images are required" });
        }

        const licenceFront = req.files.licenceFront[0].path; // Get file path
        const licenceBack = req.files.licenceBack[0].path; // Get file path

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase())) {
            console.log("Invalid email format"); // Log invalid email
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if email or phone already exists
        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
        if (existingUser) {
            console.log("Email or phone already in use"); // Log duplicate email/phone
            return res.status(400).json({ error: "Email or phone number already in use" });
        }

        // Validate password length
        if (password.length < 6) {
            console.log("Password too short"); // Log invalid password length
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("Password hashed successfully"); // Log successful password hashing

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            birthDate,
            phone,
            residence,
            email: email.toLowerCase(),
            password: hashedPassword,
            licenceFront,
            licenceBack,
        });

        await newUser.save();
        console.log("User saved successfully:", newUser); // Log successful user creation

        // Generate token and set it in the cookie
        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                residence: newUser.residence,
            },
        });
    } catch (error) {
        console.error("Error in signup controller:", error.message); // Log the error message
        res.status(500).json({ error: "Server error" });
    }
};

// Handles user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Login attempt for email:', email);

        // Find the user by email (case insensitive)
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token and set it in the cookie
        const token = generateTokenAndSetCookie(user._id, res);
        
        if (!token) {
            console.error('Failed to generate token');
            return res.status(500).json({ error: 'Failed to generate authentication token' });
        }

        console.log('Login successful for user:', user._id);

        // Return user data without sensitive information
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            residence: user.residence,
            createdAt: user.createdAt
        };

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Error in login controller:', error);
        res.status(500).json({ 
            error: 'An error occurred during login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Handles user logout
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Fetches details of the logged-in user
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            residence: user.residence,
        });
    } catch (error) {
        console.error("Error in getMe controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Deletes a user account
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in deleteUser controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Refreshes the JWT token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("jwt", newToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
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