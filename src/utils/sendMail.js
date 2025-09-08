import nodemailer from 'nodemailer';
import { env } from './env.js';

const transporter = nodemailer.createTransporter({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure: env('SMTP_SECURE') === 'true',
    auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASSWORD'),
    },
    tls: {

        rejectUnauthorized: false
    }
});

// Check connection to SMTP server at startup
export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error('SMTP connection error:', error);
        return false;
    }
};

export const sendEmail = async (options) => {
    try {
        console.log('Attempting to send email:', {
            from: options.from,
            to: options.to,
            subject: options.subject
        });

        const result = await transporter.sendMail(options);
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Email sending failed:', error);

        // Detailed log of the error object
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.response) {
            console.error('SMTP response:', error.response);
        }
        if (error.responseCode) {
            console.error('Response code:', error.responseCode);
        }

        throw error;
    }
};
