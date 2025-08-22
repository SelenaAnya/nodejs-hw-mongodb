import createHttpError from 'http-errors';

import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
    console.log('=== AUTHENTICATE MIDDLEWARE ===');
    console.log('Request headers:', req.headers);

    const authHeader = req.get('Authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader) {
        console.log('No Authorization header provided');
        next(createHttpError(401, 'Please provide Authorization header'));
        return;
    }

    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];
    console.log('Bearer:', bearer, 'Token:', token);

    if (bearer !== 'Bearer' || !token) {
        console.log('Invalid auth header format');
        next(createHttpError(401, 'Auth header should be of type Bearer'));
        return;
    }

    const session = await SessionsCollection.findOne({ accessToken: token });
    console.log('Session found:', !!session);

    if (!session) {
        console.log('Session not found in database');
        next(createHttpError(401, 'Session not found'));
        return;
    }

    const isAccessTokenExpired =
        new Date() > new Date(session.accessTokenValidUntil);
    console.log('Token expired:', isAccessTokenExpired);

    if (isAccessTokenExpired) {
        console.log('Access token has expired');
        next(createHttpError(401, 'Access token expired'));
        return;
    }

    const user = await UsersCollection.findById(session.userId);
    console.log('User found:', !!user);

    if (!user) {
        console.log('User not found in database');
        next(createHttpError(401, 'Session not found'));
        return;
    }

    req.user = user;
    console.log('User attached to request:', user._id);
    console.log('=== END AUTHENTICATE MIDDLEWARE ===');

    next();
};
