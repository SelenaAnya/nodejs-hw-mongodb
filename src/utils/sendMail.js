import nodemailer from 'nodemailer';
import { env } from './env.js';
import {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM
} from '../constants/envVars.js';

console.log('Creating email transporter with config:', {
    host: env(SMTP_HOST),
    port: env(SMTP_PORT),
    user: env(SMTP_USER),
    from: env(SMTP_FROM)
});

const transport = nodemailer.createTransport({
    host: env(SMTP_HOST),
    port: Number(env(SMTP_PORT)),
    secure: env('SMTP_SECURE') === 'true',
    auth: {
        user: env(SMTP_USER),
        pass: env(SMTP_PASSWORD),
    },
    tls: { rejectUnauthorized: false }
});




export const verifyEmailConnection = async () => {
    try {
        await transport.verify();
        console.log(' SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error(' SMTP connection error:', {
            message: error.message,
            code: error.code,
            response: error.response,
            responseCode: error.responseCode
        });
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

        // Add from if it is not present
        const emailOptions = {
            ...options,
            from: options.from || env(SMTP_FROM)
        };

        const result = await transport.sendMail(emailOptions);
        console.log(' Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error(' Email sending failed:', {
            message: error.message,
            code: error.code,
            response: error.response,
            responseCode: error.responseCode,
            command: error.command
        });

        throw error;
    }
};
