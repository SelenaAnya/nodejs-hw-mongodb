import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import {
    FIFTEEN_MINUTES,
    ONE_DAY,
} from '../constants/index.js';

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
