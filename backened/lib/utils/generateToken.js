import jwt from 'jsonwebtoken';

// Function to generate JWT tokens and set them as cookies
export const generateTokenAndSetCookie = (userId, res) => {
    // Generate short-lived access token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15m', // Token expires in 15 minutes
    });

    // Set access token as an HTTP-only cookie
    res.cookie("jwt", token, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development", // Secure in production
    });

    // Return token for frontend storage
    return token;
};