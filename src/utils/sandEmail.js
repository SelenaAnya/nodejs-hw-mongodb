import nodemailler from 'nodemailer';

const transport = nodemailler.createTransport({
    host: getEnvVar(ENV_VARS.SMTP_HOST),
    port: getEnvVar(ENV_VARS.SMTP_PORT),
    secure: true,
    auth: {
        user: getEnvVar(ENV_VARS.SMTP_USER),
        pass: getEnvVar(ENV_VARS.SMTP_PASSWORD),
    },
});
