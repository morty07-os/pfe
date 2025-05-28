import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './backened/.env' });

export const sendVerificationEmail = async (email, verificationCode) => {
    try {
        // Create reusable transporter object using SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS// Use app password for Gmail
            },
            tls: {
                rejectUnauthorized: false // Only for development
            }
        });

        // Verify transporter configuration
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        // Email content
        const mailOptions = {
            from: `"Car Rental Service" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Email Verification</h2>
                    <p style="color: #666; font-size: 16px;">Thank you for registering with our car rental service. To complete your registration, please use the following verification code:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
                </div>
            `
        };

        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};
