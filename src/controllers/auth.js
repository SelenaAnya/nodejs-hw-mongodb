import createHttpError from 'http-errors';
import { THIRTY_DAYS } from '../constants/index.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshUsersSession,
    requestResetToken,
    resetPassword
} from '../services/auth.js';
import { sendResetPasswordEmail } from '../utils/sendEmail.js';

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
};

export const registerUserController = async (req, res) => {
    console.log('Registration attempt:', req.body.email);

    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
    });
};

export const loginUserController = async (req, res) => {
    console.log('Login attempt:', req.body.email);

    const session = await loginUser(req.body);

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const refreshUserController = async (req, res) => {
    console.log('Token refresh attempt');

    if (!req.cookies.refreshToken) {
        throw createHttpError(401, 'Refresh token is required');
    }

    const session = await refreshUsersSession({
        refreshToken: req.cookies.refreshToken,
    });

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const logoutUserController = async (req, res) => {
    console.log('Logout attempt');

    if (req.cookies.refreshToken) {
        await logoutUser(req.cookies.refreshToken);
    }

    res.clearCookie('refreshToken');
    res.status(204).send();
};

export const requestResetEmailController = async (req, res) => {
    console.log('Password reset request for email:', req.body.email);

    const { email } = req.body;

    try {
        // Generate reset token
        const resetToken = await requestResetToken(email);

        // Send reset email
        await sendResetPasswordEmail(email, resetToken);

        res.json({
            status: 200,
            message: 'Reset password email has been successfully sent.',
            data: {}
        });
    } catch (error) {
        // If it's a user not found error, we still return success
        // to prevent email enumeration attacks
        if (error.status === 404) {
            res.json({
                status: 200,
                message: 'Reset password email has been successfully sent.',
                data: {}
            });
            return;
        }
        throw error;
    }
};

// Update the controller according to the instructions
export const resetPasswordController = async (req, res) => {
    await resetPassword(req.body);
    res.json({
        message: 'Password was successfully reset!',
        status: 200,
        data: {},
    });
};
