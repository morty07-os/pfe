import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendVerificationEmail from '../utils/email.utils.js';



// Handles user signup
export const signup = async (req, res) => {
    try {
        console.log("Signup request body:", req.body);

        const { firstName, lastName, birthDate, phone, residence, email, password } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        if (!req.files || !req.files.licenceFront || !req.files.licenceBack) {
            return res.status(400).json({ error: "Driving licence images are required" });
        }

        const licenceFront = req.files.licenceFront[0].path;
        const licenceBack = req.files.licenceBack[0].path;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase())) {
            console.log("Invalid email format");
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
        if (existingUser) {
            console.log("Email or phone already in use");
            return res.status(400).json({ error: "Email or phone number already in use" });
        }

        if (password.length < 6) {
            console.log("Password too short");
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

        // Set expiration time for the verification code (e.g., 10 minutes)
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); 

        // Create a new user with the plain password
        const newUser = new User({
            firstName,
            lastName,
            birthDate,
            phone,
            residence,
            email: email.toLowerCase(),
            password, // Pass the plain password here
            licenceFront,
            licenceBack,
            verificationToken: hashedVerificationCode,
            verificationTokenExpires: verificationCodeExpires,
            isVerified: false, // User is not verified until email verification
        });

        await newUser.save();
        console.log("User saved successfully:", newUser);

        // Send verification email
        await sendVerificationEmail(newUser.email, verificationCode);

        res.status(201).json({
            message: "User registered successfully. Please check your email for verification.",
            email: newUser.email, // Send email back to frontend for redirection to verification page
        });
    } catch (error) {
        console.error("Error in signup controller:", error.message);
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

// Handles email verification
export const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({ error: "Email and verification code are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        if (!user.verificationToken || !user.verificationTokenExpires) {
            return res.status(400).json({ error: "No verification code found or it has expired. Please request a new one." });
        }

        if (user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
        }

        const isCodeValid = await bcrypt.compare(verificationCode, user.verificationToken);

        if (!isCodeValid) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Generate token and set it in the cookie after successful verification
        const token = generateTokenAndSetCookie(user._id, res);
        
        if (!token) {
            console.error('Failed to generate token after email verification');
            return res.status(500).json({ error: 'Failed to generate authentication token after verification' });
        }

        res.status(200).json({
            message: "Email verified successfully. You can now log in.",
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error("Error in verifyEmail controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Handles resending verification code
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email is already verified." });
        }

        // Generate new 6-digit verification code
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedNewVerificationCode = await bcrypt.hash(newVerificationCode, 10);

        // Set new expiration time (e.g., 10 minutes from now)
        const newVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.verificationToken = hashedNewVerificationCode;
        user.verificationTokenExpires = newVerificationCodeExpires;
        await user.save();

        // Send the new verification email
        await sendVerificationEmail(user.email, newVerificationCode);

        res.status(200).json({ message: "New verification code sent to your email." });
    } catch (error) {
        console.error("Error in resendVerificationCode controller:", error.message);
        res.status(500).json({ error: "Server error" });
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
