import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import {
    FIFTEEN_MINUTES,
    ONE_DAY,
} from '../constants/index.js';

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY * 30),
    };
};

export const registerUser = async (payload) => {
    // Перевірка чи користувач вже існує
    const existingUser = await UsersCollection.findOne({ email: payload.email });
    if (existingUser) {
        throw createHttpError(409, 'Email in use');
    }

    // Хешування пароля
    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    // Створення користувача
    const user = await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });

    return user;
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(401, 'Unauthorized');
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);
    if (!isEqual) {
        throw createHttpError(401, 'Unauthorized');
    }

    await SessionsCollection.deleteOne({ userId: user._id });

    const newSession = createSession();

    return await SessionsCollection.create({
        userId: user._id,
        ...newSession,
    });
};

export const refreshUsersSession = async ({ refreshToken }) => {
    const session = await SessionsCollection.findOne({ refreshToken });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired =
        new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token expired');
    }

    await SessionsCollection.deleteOne({ _id: session._id });

    const newSession = createSession();

    return await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });
};

export const logoutUser = async (refreshToken) => {
    await SessionsCollection.deleteOne({ refreshToken });
};
