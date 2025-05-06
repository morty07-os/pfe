import jwt from 'jsonwebtoken';

// Function to generate JWT tokens and set them as cookies
export const generateTokenAndSetCookie = (userId, res) => {
    try {
        if (!userId) {
            console.error('No user ID provided for token generation');
            return null;
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return null;
        }

        // Generate token with user ID
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Increased to 7 days for better user experience
        );

        if (!token) {
            console.error('Failed to generate token');
            return null;
        }

        // Set HTTP-only cookie with the token
        const cookieOptions = {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        };

        res.cookie('jwt', token, cookieOptions);
        console.log('Token generated and cookie set for user:', userId);
        
        return token;
    } catch (error) {
        console.error('Error in generateTokenAndSetCookie:', error);
        return null;
    }
};