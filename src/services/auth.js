import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import {
    FIFTEEN_MINUTES,
    THIRTY_DAYS,
} from '../constants/index.js';
import { env } from '../utils/env.js';

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
    };
};

export const registerUser = async (payload) => {
    console.log('Registering user with email:', payload.email);

    // Check if the user already exists
    const existingUser = await UsersCollection.findOne({
        email: payload.email.toLowerCase()
    });

    if (existingUser) {
        console.log('User already exists:', payload.email);
        throw createHttpError(409, 'Email in use');
    }

    // Additional validation
    if (!payload.name || payload.name.trim().length < 2) {
        throw createHttpError(400, 'Name must be at least 2 characters long');
    }

    if (!payload.password || payload.password.length < 6) {
        throw createHttpError(400, 'Password must be at least 6 characters long');
    }

    // Password hashing
    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    // Create a user with a normalized email
    const user = await UsersCollection.create({
        ...payload,
        email: payload.email.toLowerCase(),
        name: payload.name.trim(),
        password: encryptedPassword,
    });

    console.log('User registered successfully:', user._id);
    return user;
};

export const loginUser = async (payload) => {
    console.log('Login attempt for email:', payload.email);

    if (!payload.email || !payload.password) {
        throw createHttpError(400, 'Email and password are required');
    }

    const user = await UsersCollection.findOne({
        email: payload.email.toLowerCase()
    });

    if (!user) {
        console.log('User not found:', payload.email);
        throw createHttpError(401, 'Invalid credentials');
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);
    if (!isEqual) {
        console.log('Invalid password for user:', payload.email);
        throw createHttpError(401, 'Invalid credentials');
    }

    // Delete the previous user session
    await SessionsCollection.deleteMany({ userId: user._id });

    const newSession = createSession();

    const session = await SessionsCollection.create({
        userId: user._id,
        ...newSession,
    });

    console.log('Login successful for user:', user._id);
    return session;
};

export const refreshUsersSession = async ({ refreshToken }) => {
    console.log('Refreshing session');

    if (!refreshToken) {
        throw createHttpError(401, 'Refresh token is required');
    }

    const session = await SessionsCollection.findOne({ refreshToken });

    if (!session) {
        console.log('Session not found for refresh token');
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired =
        new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
        console.log('Refresh token expired');
        // Delete an outdated session
        await SessionsCollection.deleteOne({ _id: session._id });
        throw createHttpError(401, 'Session token expired');
    }

    // Delete an old session
    await SessionsCollection.deleteOne({ _id: session._id });

    const newSession = createSession();

    const createdSession = await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });

    console.log('Session refreshed successfully');
    return createdSession;
};

export const logoutUser = async (refreshToken) => {
    console.log('Logging out user');

    if (!refreshToken) {
        return;
    }

    const result = await SessionsCollection.deleteOne({ refreshToken });
    console.log('Sessions deleted:', result.deletedCount);
};

export const requestResetToken = async (email) => {
    console.log('Requesting reset token for email:', email);

    const user = await UsersCollection.findOne({
        email: email.toLowerCase()
    });

    if (!user) {
        console.log('User not found for password reset:', email);
        throw createHttpError(404, 'User not found!');
    }

    // Create JWT token with 5 minutes expiration
    const resetToken = jwt.sign(
        {
            sub: user._id,
            email: user.email
        },
        env('JWT_SECRET'),
        {
            expiresIn: '5m'
        }
    );

    console.log('Reset token created successfully for user:', user._id);
    return resetToken;
};

// Updated method according to the instructions
export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, err.message);
        throw err;
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword },
    );

    // Additionally, delete all user sessions (for security)
    await SessionsCollection.deleteMany({ userId: user._id });

    console.log('Password reset successfully for user:', user._id);
};
