import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.utils.js';



// Handles user signup
export const signup = async (req, res) => {
    try {
        console.log("Signup request body:", req.body);

        const { firstName, lastName, birthDate, phone, residence, email, password } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName || !birthDate || !phone || !residence) {
            return res.status(400).json({ error: "All fields are required" });
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

        // Create a new user with the plain password (it will be hashed by the pre-save hook)
        const newUser = new User({
            firstName,
            lastName,
            birthDate,
            phone,
            residence,
            email: email.toLowerCase(),
            password: password,
            licenceFront,
            licenceBack,
            verificationToken: hashedVerificationCode,
            verificationTokenExpires: verificationCodeExpires,
            isVerified: false,
        });

        await newUser.save();
        console.log("User saved successfully:", newUser._id);

        // Send verification email
        try {
            await sendVerificationEmail(newUser.email, verificationCode);
            console.log("Verification email sent successfully");
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
            // Don't fail the signup if email fails, just log it
        }

        res.status(201).json({
            message: "User registered successfully. Please check your email for verification.",
            email: newUser.email,
        });
    } catch (error) {
        console.error("Error in signup controller:", error);
        res.status(500).json({
            error: "Server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Handles password reset request (sends verification code)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        console.log(`Password reset request for email: ${email}`);

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`User not found for email: ${email}`);
            // Return a generic message to prevent email enumeration
            return res.status(404).json({ message: "If a user with that email exists, a password reset code has been sent." });
        }

        // Generate 6-digit password reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedResetCode = await bcrypt.hash(resetCode, 10);

        // Set expiration time for the reset code (e.g., 15 minutes)
        const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.passwordResetToken = hashedResetCode;
        user.passwordResetExpires = resetCodeExpires;
        await user.save();
        console.log(`Password reset code generated for user: ${user._id}`);

        // Send password reset email with the code
        try {
            // Assuming sendPasswordResetEmail function exists in email.utils.js
            // and can handle sending a code instead of a link
            await sendPasswordResetEmail(user.email, resetCode, 'password_reset'); // Pass type 'password_reset'
            console.log(`Password reset email sent to: ${user.email}`);
        } catch (emailError) {
            console.error(`Error sending password reset email: ${emailError.message}`);
            return res.status(500).json({ error: "Failed to send password reset email. Please try again later." });
        }

        res.status(200).json({ message: "Password reset code sent to your email." });
    } catch (error) {
        console.error("Error in forgotPassword controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Handles password reset with verification code
export const resetPassword = async (req, res) => {
    try {
        const { email, verificationCode, newPassword } = req.body;

        if (!email || !verificationCode || !newPassword) {
            return res.status(400).json({ error: "Email, verification code, and new password are required" });
        }

        console.log(`Password reset attempt for email: ${email} with code: ${verificationCode}`);

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.passwordResetToken || !user.passwordResetExpires) {
            console.log(`No password reset token found for user: ${user._id}`);
            return res.status(400).json({ error: "No password reset request found or it has expired. Please request a new one." });
        }

        if (user.passwordResetExpires < Date.now()) {
            console.log(`Password reset token expired for user: ${user._id}`);
            return res.status(400).json({ error: "Password reset code has expired. Please request a new one." });
        }

        const isCodeValid = await bcrypt.compare(verificationCode, user.passwordResetToken);

        if (!isCodeValid) {
            console.log(`Invalid password reset code for user: ${user._id}`);
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (newPassword.length < 6) {
            console.log("New password too short");
            return res.status(400).json({ error: "New password must be at least 6 characters long" });
        }

        // Hash the new password and update user
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        user.passwordResetToken = undefined; // Clear the reset token
        user.passwordResetExpires = undefined; // Clear the expiration time

        await user.save();
        console.log(`Password reset successfully for user: ${user._id}`);

        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error("Error in resetPassword controller:", error.message);
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

        // Check if user is verified
        if (!user.isVerified) {
            console.log('User not verified:', email);
            return res.status(403).json({ 
                error: 'Email not verified', 
                needsVerification: true,
                email: user.email
            });
        }

        // Generate token and set it in the cookie
        const token = generateTokenAndSetCookie(user._id, res);
        
        if (!token) {
            console.error('Failed to generate token');
            return res.status(500).json({ error: 'Failed to generate authentication token' });
        }

        console.log('Login successful for user:', user._id);

        // Generate Refresh Token
        const refreshToken = crypto.randomBytes(32).toString('hex');
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        // Save hashed refresh token to user document
        user.refreshToken = hashedRefreshToken;
        await user.save();

        // Set Refresh Token as HTTP-only cookie
        const refreshTokenCookieOptions = {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration for refresh token
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/api/auth/refresh-token' // Set path to the refresh token endpoint
        };
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
        console.log('Refresh token cookie set for user:', user._id);


        // Return user data without sensitive information
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            residence: user.residence,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        res.status(200).json({
            message: 'Login successful',
            token, // This is the access token (JWT)
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

        console.log(`Verification attempt for email: ${email} with code: ${verificationCode}`);

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            console.log(`Email already verified for user: ${user._id}`);
            return res.status(400).json({ error: "Email already verified" });
        }

        if (!user.verificationToken || !user.verificationTokenExpires) {
            console.log(`No verification token found for user: ${user._id}`);
            return res.status(400).json({ error: "No verification code found or it has expired. Please request a new one." });
        }

        if (user.verificationTokenExpires < Date.now()) {
            console.log(`Verification token expired for user: ${user._id}`);
            return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
        }

        const isCodeValid = await bcrypt.compare(verificationCode, user.verificationToken);

        if (!isCodeValid) {
            console.log(`Invalid verification code for user: ${user._id}`);
            return res.status(400).json({ error: "Invalid verification code" });
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        
        await user.save();
        console.log(`User ${user._id} verified successfully`);

        // Generate token and set it in the cookie after successful verification
        const token = generateTokenAndSetCookie(user._id, res);
        
        if (!token) {
            console.error('Failed to generate token after email verification');
            return res.status(500).json({ error: 'Failed to generate authentication token after verification' });
        }

        // Return complete user data (without sensitive information)
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            residence: user.residence,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        res.status(200).json({
            message: "Email verified successfully. You are now logged in.",
            token,
            user: userResponse
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

        console.log(`Resending verification code for email: ${email}`);

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            console.log(`Email already verified for user: ${user._id}`);
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
        console.log(`New verification code generated for user: ${user._id}`);

        // Send the new verification email
        try {
            await sendVerificationEmail(user.email, newVerificationCode);
            console.log(`Verification email sent to: ${user.email}`);
        } catch (emailError) {
            console.error(`Error sending verification email: ${emailError.message}`);
            return res.status(500).json({ error: "Failed to send verification email. Please try again later." });
        }

        res.status(200).json({ message: "New verification code sent to your email." });
    } catch (error) {
        console.error("Error in resendVerificationCode controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Handles user logout
export const logout = async (req, res) => {
    try {
        // Clear the access token cookie
        res.cookie("jwt", "", { maxAge: 0 });

        // Clear the refresh token cookie
        res.cookie("refreshToken", "", { maxAge: 0, path: '/api/auth/refresh-token' }); // Ensure path matches the one set in login

        // Invalidate the refresh token in the database
        if (req.user && req.user.userId) {
            const user = await User.findById(req.user.userId);
            if (user) {
                user.refreshToken = undefined; // Remove the refresh token
                await user.save();
                console.log(`Refresh token invalidated for user: ${req.user.userId}`);
            }
        }

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

        // Find user by comparing the refresh token with the hashed token in the database
        const user = await User.findOne({}); // Need to find user based on hashed refresh token

        // Iterate through users to find a match for the refresh token
        // This is inefficient for large number of users, consider adding an index on hashed refresh token if possible
        // Or a different approach for refresh token storage/validation
        const users = await User.find({}); // Fetch all users (inefficient)
        let foundUser = null;
        for (const u of users) {
            if (u.refreshToken && await bcrypt.compare(refreshToken, u.refreshToken)) {
                foundUser = u;
                break;
            }
        }

        if (!foundUser) {
             console.log("Invalid or expired refresh token - user not found");
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        // Generate a new access token (JWT)
        const newToken = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set the new access token as an HTTP-only cookie
        const accessTokenCookieOptions = {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration for access token
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Consistent sameSite
            secure: process.env.NODE_ENV === 'production',
            path: '/' // Consistent path
        };
        res.cookie("jwt", newToken, accessTokenCookieOptions);
        console.log('New access token generated and cookie set for user:', foundUser._id);


        // Optionally, generate and set a new refresh token and invalidate the old one
        // This adds complexity but improves security by rotating refresh tokens
        // const newRefreshToken = crypto.randomBytes(32).toString('hex');
        // const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
        // foundUser.refreshToken = hashedNewRefreshToken;
        // await foundUser.save();
        // const newRefreshTokenCookieOptions = { ...refreshTokenCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }; // Longer expiration
        // res.cookie('refreshToken', newRefreshToken, newRefreshTokenCookieOptions);


        res.status(200).json({ message: "Token refreshed successfully", token: newToken });
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        res.status(401).json({ error: "Invalid or expired refresh token" });
    }
};
