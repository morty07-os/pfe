import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backened/.env' });

// Validate required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_APP_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const sendVerificationEmail = async (email, verificationCode) => {
    try {
        // Log email configuration (without sensitive data)
        console.log('Email configuration:', {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            user: process.env.EMAIL_USER ? 'configured' : 'missing',
            pass: process.env.EMAIL_APP_PASSWORD ? 'configured' : 'missing'
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP connection verification failed:', verifyError);
            throw new Error('Failed to verify SMTP connection: ' + verifyError.message);
        }

        const mailOptions = {
            from: `"Car Rental Service" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Car Rental Website - Email Verification',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #475569; text-align: center; margin-bottom: 20px;">Email Verification</h2>
                    <p style="font-size: 16px;">Thank you for signing up for the Car Rental Website!</p>
                    <p style="font-size: 16px;">Please use the following 6-digit code to verify your email address:</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                        <h3 style="color: #334155; font-size: 24px; letter-spacing: 4px; margin: 0;">${verificationCode}</h3>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">This code is valid for 10 minutes.</p>
                    <p style="font-size: 14px; color: #64748b;">If you did not sign up for this service, please ignore this email.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #64748b;">Best regards,<br>The Car Rental Team</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please check your email credentials.');
        } else if (error.code === 'ESOCKET') {
            throw new Error('Network error while sending email. Please check your internet connection.');
        } else {
            throw new Error('Failed to send verification email: ' + error.message);
        }
    }
};

export default sendVerificationEmail;
