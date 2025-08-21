import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        next(createHttpError(401, 'Please provide Authorization header'));
        return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        next(createHttpError(401, 'Token is required'));
        return;
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            next(createHttpError(401, 'Access token expired'));
            return;
        }
        next(createHttpError(401, 'Token is invalid'));
        return;
    }

    // Find session with this access token
    const session = await SessionsCollection.findOne({
        accessToken: token,
    });

    if (!session) {
        next(createHttpError(401, 'Session not found'));
        return;
    }

    // Check if access token is still valid by date
    const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
    if (isAccessTokenExpired) {
        next(createHttpError(401, 'Access token expired'));
        return;
    }

    // Find user
    const user = await UsersCollection.findById(session.userId);
    if (!user) {
        next(createHttpError(401, 'Session not found'));
        return;
    }

    // Add user to request object (without password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    req.user = userWithoutPassword;

    next();
};
