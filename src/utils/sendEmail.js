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
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .container { background-color: #f8f9fa; padding: 20px; border-radius: 8px; }
                .header { color: #333; text-align: center; margin-bottom: 20px; }
                .content { color: #666; line-height: 1.6; }
                .button {
                    display: inline-block;
                    background-color: #007bff;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .footer { color: #666; font-size: 14px; margin-top: 20px; }
                .center { text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 class="header">Password Reset Request</h2>
                <p class="content">
                    You have requested to reset your password. Click the button below to reset your password:
                </p>
                <div class="center">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p class="footer">
                    If you didn't request this password reset, please ignore this email.
                    This link will expire in 5 minutes for security reasons.
                </p>
                <p class="footer">
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

export default sendEmail;
