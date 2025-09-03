import nodemailler from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import createHttpError from 'http-errors';

const transport = nodemailler.createTransport({
    host: getEnvVar(ENV_VARS.SMTP_HOST),
    port: getEnvVar(ENV_VARS.SMTP_PORT),
    secure: true,
    auth: {
        user: getEnvVar(ENV_VARS.SMTP_USER),
        pass: getEnvVar(ENV_VARS.SMTP_PASSWORD),
    },
});

await transport.verify();

export const sendEmail = async (to, subject, html) => {
    try {
        const from = getEnvVar('SMTP_FROM');
        const info = await transport.sendMail({ from, to, subject, html });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new createHttpError.InternalServerError('Failed to send email');
    }
};

export default transport;
