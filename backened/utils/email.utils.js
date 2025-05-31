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

const sendEmail = async (to, subject, htmlContent) => {
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
            to: to,
            subject: subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to} with subject "${subject}"`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Provide more detailed error information
        const errorMessage = error.message || 'Unknown error';
        const errorCode = error.code || 'UNKNOWN';
        console.error(`Email error details - Code: ${errorCode}, Message: ${errorMessage}`);
        
        throw new Error(`Failed to send email: ${errorMessage} (${errorCode})`);
    }
};

export default sendEmail;
