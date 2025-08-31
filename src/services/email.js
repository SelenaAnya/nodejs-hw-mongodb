import nodemailer from 'nodemailer';
import { env } from '../utils/env.js';

// Create a transport for sending letters
const transporter = nodemailer.createTransporter({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure: false,
    auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASSWORD'),
    },
});

// Checking the connection to the SMTP server
export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP server connection verified');
        return true;
    } catch (error) {
        console.error('SMTP server connection failed:', error);
        return false;
    }
};

// Sending an email to reset the password
export const sendResetPasswordEmail = async (email, resetToken) => {
    const appDomain = env('APP_DOMAIN');
    const resetUrl = `${appDomain}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: env('SMTP_FROM'),
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You have requested to reset your password. Click the link below to reset your password:</p>
                <div style="margin: 20px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 5 minutes. If you didn't request this password reset, please ignore this email.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
            </div>
        `,
        text: `
            Password Reset Request

            You have requested to reset your password. Click the link below to reset your password:
            ${resetUrl}

            This link will expire in 5 minutes. If you didn't request this password reset, please ignore this email.
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Reset password email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Failed to send reset password email:', error);
        throw error;
    }
};
