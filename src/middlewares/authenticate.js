import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
    console.log('=== AUTHENTICATE MIDDLEWARE ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);

    const authHeader = req.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
        console.log('No Authorization header provided');
        return next(createHttpError(401, 'Authorization header is required'));
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer') {
        console.log('Invalid auth header format - bearer:', bearer);
        return next(createHttpError(401, 'Auth header should be of type Bearer'));
    }

    if (!token || token.trim() === '') {
        console.log('No token provided in Authorization header');
        return next(createHttpError(401, 'Access token is required'));
    }

    try {
        const session = await SessionsCollection.findOne({
            accessToken: token.trim()
        }).populate('userId');

        console.log('Session found:', !!session);

        if (!session) {
            console.log('Session not found in database for token');
            return next(createHttpError(401, 'Access token is invalid'));
        }

        const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
        console.log('Token expired:', isAccessTokenExpired);
        console.log('Current time:', new Date().toISOString());
        console.log('Token valid until:', new Date(session.accessTokenValidUntil).toISOString());

        if (isAccessTokenExpired) {
            console.log('Access token has expired');
            await SessionsCollection.deleteOne({ _id: session._id });
            return next(createHttpError(401, 'Access token expired'));
        }

        const user = await UsersCollection.findById(session.userId);
        console.log('User found:', !!user);

        if (!user) {
            console.log('User not found in database for session');
            await SessionsCollection.deleteOne({ _id: session._id });
            return next(createHttpError(401, 'User not found'));
        }

        // Add user to req object without sensitive information
        req.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('User attached to request:', user._id);
        console.log('=== END AUTHENTICATE MIDDLEWARE ===');

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return next(createHttpError(500, 'Authentication failed'));
    }
};
