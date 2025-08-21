import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const registerUser = async (payload) => {
    const { name, email, password } = payload;

    // Check if user with this email already exists
    const existingUser = await UsersCollection.findOne({ email });
    if (existingUser) {
        throw createHttpError(409, 'Email in use');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await UsersCollection.create({
        name,
        email,
        password: hashedPassword,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
};

export const loginUser = async (payload) => {
    const { email, password } = payload;

    // Find user by email
    const user = await UsersCollection.findOne({ email });
    if (!user) {
        throw createHttpError(401, 'Unauthorized');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw createHttpError(401, 'Unauthorized');
    }

    // Delete existing session for this user
    await SessionsCollection.deleteOne({ userId: user._id });

    // Generate tokens
    const accessToken = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = randomBytes(40).toString('base64url');

    // Create session
    const session = await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
        session,
        user: { ...user.toObject(), password: undefined }
    };
};

export const refreshUserSession = async (sessionId, refreshToken) => {
    // Find session
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    // Check if refresh token is still valid
    const isRefreshTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isRefreshTokenExpired) {
        throw createHttpError(401, 'Session not found');
    }

    // Find user
    const user = await UsersCollection.findById(session.userId);
    if (!user) {
        throw createHttpError(401, 'Session not found');
    }

    // Delete old session
    await SessionsCollection.deleteOne({ _id: sessionId });

    // Generate new tokens
    const accessToken = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = randomBytes(40).toString('base64url');

    // Create new session
    const newSession = await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
        session: newSession,
        user: { ...user.toObject(), password: undefined }
    };
};

export const logoutUser = async (sessionId, refreshToken) => {
    // Delete session
    await SessionsCollection.deleteOne({
        _id: sessionId,
        refreshToken,
    });
};
