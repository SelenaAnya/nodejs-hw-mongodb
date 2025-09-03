import nodemailer from 'nodemailer';
import { env } from './env.js';
import createHttpError from 'http-errors';

const createTransporter = () => {
    return nodemailer.createTransporter({
        host: env('SMTP_HOST'),
        port: parseInt(env('SMTP_PORT')),
        secure: env('SMTP_PORT') === '465', // true for 465, false for other ports
        auth: {
            user: env('SMTP_USER'),
            pass: env('SMTP_PASSWORD'),
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

export const sendEmail = async (options) => {
    const transporter = createTransporter();

    try {
        // Verify transporter configuration
        await transporter.verify();

        const mailOptions = {
            from: env('SMTP_FROM'),
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw createHttpError(500, 'Failed to send the email, please try again later.');
    }
};

export const sendResetPasswordEmail = async (email, resetToken) => {
    const resetUrl = `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                <p style="color: #666; line-height: 1.6;">
                    You have requested to reset your password. Click the button below to reset your password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #007bff; color: white; padding: 12px 30px;
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If you didn't request this password reset, please ignore this email.
                    This link will expire in 5 minutes for security reasons.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
                </p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: htmlContent,
    });
};
