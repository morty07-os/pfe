import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sendVerificationEmail = async (email, verificationCode) => {
    try {
        // Log email configuration for debugging
        console.log('Email Configuration:');
        console.log('- HOST:', process.env.EMAIL_HOST);
        console.log('- PORT:', process.env.EMAIL_PORT);
        console.log('- SECURE:', process.env.EMAIL_SECURE);
        console.log('- USER:', process.env.EMAIL_USER);
        console.log('- PASS:', process.env.EMAIL_PASS ? '******' : 'Not set');

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true', // Use the value from .env
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            debug: true, // Enable debug output
        });

        // Verify SMTP connection configuration
        try {
            await transporter.verify();
            console.log('SMTP server connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP connection verification failed:', verifyError);
            throw new Error(`SMTP verification failed: ${verifyError.message}`);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Car Rental Website - Email Verification',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #475569;">Email Verification</h2>
                    <p>Thank you for signing up for the Car Rental Website!</p>
                    <p>Please use the following 6-digit code to verify your email address:</p>
                    <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block; letter-spacing: 2px;">${verificationCode}</h3>
                    <p>This code is valid for 10 minutes.</p>
                    <p>If you did not sign up for this service, please ignore this email.</p>
                    <p>Best regards,<br>The Car Rental Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Provide more detailed error information
        const errorMessage = error.message || 'Unknown error';
        const errorCode = error.code || 'UNKNOWN';
        console.error(`Email error details - Code: ${errorCode}, Message: ${errorMessage}`);

        throw new Error(`Failed to send verification email: ${errorMessage} (${errorCode})`);
    }
};

const sendPasswordResetEmail = async (email, resetCode) => {
    try {
        // Log email configuration for debugging
        console.log('Email Configuration (Password Reset):');
        console.log('- HOST:', process.env.EMAIL_HOST);
        console.log('- PORT:', process.env.EMAIL_PORT);
        console.log('- SECURE:', process.env.EMAIL_SECURE);
        console.log('- USER:', process.env.EMAIL_USER);
        console.log('- PASS:', process.env.EMAIL_PASS ? '******' : 'Not set');

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true', // Use the value from .env
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            debug: true, // Enable debug output
        });

        // Verify SMTP connection configuration
        try {
            await transporter.verify();
            console.log('SMTP server connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP connection verification failed (Password Reset):', verifyError);
            throw new Error(`SMTP verification failed: ${verifyError.message}`);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Car Rental Website - Password Reset Code',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #475569;">Password Reset</h2>
                    <p>You requested a password reset for your Car Rental Website account.</p>
                    <p>Please use the following 6-digit code to reset your password:</p>
                    <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block; letter-spacing: 2px;">${resetCode}</h3>
                    <p>This code is valid for 15 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <p>Best regards,<br>The Car Rental Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        // Provide more detailed error information
        const errorMessage = error.message || 'Unknown error';
        const errorCode = error.code || 'UNKNOWN';
        console.error(`Email error details (Password Reset) - Code: ${errorCode}, Message: ${errorMessage}`);

        throw new Error(`Failed to send password reset email: ${errorMessage} (${errorCode})`);
    }
};


export { sendVerificationEmail, sendPasswordResetEmail };
