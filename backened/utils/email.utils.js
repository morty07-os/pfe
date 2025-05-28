import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './backened/.env' });

const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 587,
            secure: false, // Use 'false' for port 587
            requireTLS: true, // Enforce TLS for port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

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
        throw new Error('Failed to send verification email');
    }
};

export default sendVerificationEmail;
