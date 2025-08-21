import createHttpError from 'http-errors';
import { registerUser, loginUser, refreshUserSession, logoutUser } from '../services/auth.js';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const SESSION_COOKIE_NAME = 'sessionId';

export const registerUserController = async (req, res, next) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
    });
};

export const loginUserController = async (req, res, next) => {
    const { session, user } = await loginUser(req.body);

    // Set refresh token and session ID in cookies
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, session.refreshToken, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.cookie(SESSION_COOKIE_NAME, session._id, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const refreshUserSessionController = async (req, res, next) => {
    const { refreshToken, sessionId } = req.cookies;

    if (!refreshToken || !sessionId) {
        throw createHttpError(401, 'Session not found');
    }

    const { session } = await refreshUserSession(sessionId, refreshToken);

    // Set new refresh token and session ID in cookies
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, session.refreshToken, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.cookie(SESSION_COOKIE_NAME, session._id, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil, import { registerUser, loginUser, refreshUserSession, logoutUser } from '../services/auth.js';

        const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
        const SESSION_COOKIE_NAME = 'sessionId';

        export const registerUserController = async (req, res, next) => {
            const user = await registerUser(req.body);

            res.status(201).json({
                status: 201,
                message: 'Successfully registered a user!',
                data: user,
            });
        };

        export const loginUserController = async (req, res, next) => {
            const { session, user } = await loginUser(req.body);

            // Set refresh token and session ID in cookies
            res.cookie(REFRESH_TOKEN_COOKIE_NAME, session.refreshToken, {
                httpOnly: true,
                expires: session.refreshTokenValidUntil,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.cookie(SESSION_COOKIE_NAME, session._id, {
                httpOnly: true,
                expires: session.refreshTokenValidUntil,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({
                status: 200,
                message: 'Successfully logged in an user!',
                data: {
                    accessToken: session.accessToken,
                },
            });
        };

        export const refreshUserSessionController = async (req, res, next) => {
            const { refreshToken, sessionId } = req.cookies;

            if (!refreshToken || !sessionId) {
                throw createHttpError(401, 'Session not found');
            }

            const { session } = await refreshUserSession(sessionId, refreshToken);

            // Set new refresh token and session ID in cookies
            res.cookie(REFRESH_TOKEN_COOKIE_NAME, session.refreshToken, {
                httpOnly: true,
                expires: session.refreshTokenValidUntil,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.cookie(SESSION_COOKIE_NAME, session._id, {
                httpOnly: true,
                expires: session.refreshTokenValidUntil,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({
                status: 200,
                message: 'Successfully refreshed a session!',
                data: {
                    accessToken: session.accessToken,
                },
            });
        };

        export const logoutUserController = async (req, res, next) => {
            const { refreshToken, sessionId } = req.cookies;

            if (refreshToken && sessionId) {
                await logoutUser(sessionId, refreshToken);
            }

            // Clear cookies
            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
            res.clearCookie(SESSION_COOKIE_NAME);

            res.status(204).send();
        };
