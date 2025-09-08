import nodemailer from 'nodemailer';
import { env } from './env.js';

console.log('Creating email transporter with config:', {
    host: env('SMTP_HOST'),
    port: env('SMTP_PORT'),
    secure: env('SMTP_SECURE'),
    user: env('SMTP_USER'),
    from: env('SMTP_FROM')
});

const transporter = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure: env('SMTP_SECURE') === 'true', // true для порту 465, false для інших портів
    auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASSWORD'),
    },
    tls: {
        // Не перевіряти сертифікат для ukr.net (якщо потрібно)
        rejectUnauthorized: false
    },
    debug: true, // увімкнути debug режим
    logger: true // увімкнути логування
});

// Перевірити підключення до SMTP сервера при запуску
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

        // Детальний лог помилки
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
