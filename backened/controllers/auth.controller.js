import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// In-memory store for verification codes (for demonstration purposes)
// In a production environment, use a database or a cache like Redis
const verificationCodes = {};

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services or SMTP
    auth: {
        user: 'mohamed19osmani@gmail.com', // Your email address
        pass: 'amin 07osmani', // Your email password or app-specific password
    },
});

// Handles sending verification code to email
export const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: "User with this email does not exist." });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const expirationTime = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

        verificationCodes[email] = { code, expirationTime };
        console.log(`Generated code for ${email}: ${code}`);

        const mailOptions = {
            from: 'mohamed19osmani@gmail.com',
            to: email,
            subject: 'Your Email Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Email Verification</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering. Please use the following verification code to complete your signup:</p>
                    <p style="font-size: 24px; font-weight: bold; color: #0056b3; background-color: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block;">${code}</p>
                    <p>This code is valid for 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>Best regards,<br>Your Car Rental Team</p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ error: "Failed to send verification email." });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: "Verification code sent successfully." });
        });

    } catch (error) {
        console.error("Error in sendVerificationCode controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Handles verifying the email code
export const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: "Email and code are required." });
        }

        const storedData = verificationCodes[email];

        if (!storedData) {
            return res.status(400).json({ error: "No verification code found for this email or it has expired." });
        }

        if (storedData.expirationTime < Date.now()) {
            delete verificationCodes[email]; // Remove expired code
            return res.status(400).json({ error: "Verification code has expired." });
        }

        if (storedData.code !== code) {
            return res.status(400).json({ error: "Invalid verification code." });
        }

        // Code is valid, remove it from storage
        delete verificationCodes[email];

        res.status(200).json({ message: "Email verified successfully." });

    } catch (error) {
        console.error("Error in verifyCode controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};


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
        });

        await newUser.save();
        console.log("User saved successfully:", newUser);

        const token = generateTokenAndSetCookie(newUser._id, res);

        if (!token) {
            console.error('Failed to generate token during signup');
            return res.status(500).json({ error: 'Failed to generate authentication token during signup' });
        }

        res.status(201).json({
            message: "User registered successfully",
            token,
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
