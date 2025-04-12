import jwt from 'jsonwebtoken';

// Function to generate JWT tokens and set them as cookies
export const generateTokenAndSetCookie = (userId, res) => {
    // Generate short-lived access token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15m', // Token expires in 15 minutes
    });

    // Generate long-lived refresh token
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });

    // Set access token as an HTTP-only cookie
    res.cookie("jwt", token, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development", // Secure in production
    });

    // Set refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development", // Secure in production
    });
};