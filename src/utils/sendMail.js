import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';
import { env } from './env.js';
import { ENV_VARS } from '../constants/envVars.js';

const transporter = nodemailer.createTransport({
    host: env(ENV_VARS.SMTP_HOST),
    port: Number(env(ENV_VARS.SMTP_PORT)),
    secure: 'true',
    auth: {
        user: env(ENV_VARS.SMTP_USER),
        pass: env(ENV_VARS.SMTP_PASSWORD)
    }
})

await transporter.verify();


export const sendEmail = async ({ to, subject, from, text, html }) => {
    try {
        await transporter.sendMail({
            to,
            subject,
            from,
            text,
            html,
            from: env(ENV_VARS.SMTP_FROM)
        });

    } catch (error) {
        console.error('Error sending email:', error);
        throw createHttpError(500, 'Failed to send email');
    }
}
//         const result = await transporter.sendMail(options);
//         console.log('Email sent successfully:', result.messageId);
//         return result;
//     } catch (error) {
//         console.error('Email sending failed:', error);
//         throw createHttpError(500, 'Failed to send email');
//     }
// };
