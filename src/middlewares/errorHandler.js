import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
    // Don't log 404 errors as they're usually bots/crawlers
    if (err.status !== 404) {
        console.error('Error occurred:', {
            message: err.message,
            status: err.status || 500,
            url: req.url,
            method: req.method,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    }

    // Handle HTTP errors (from http-errors package)
    if (err instanceof HttpError) {
        res.status(err.status).json({
            status: err.status,
            message: err.message,
            data: null,
        });
        return;
    }

    // Handle Joi validation errors
    if (err.isJoi) {
        const errorMessages = err.details.map(detail => detail.message).join(', ');
        res.status(400).json({
            status: 400,
            message: `Validation error: ${errorMessages}`,
            data: null,
        });
        return;
    }

    // Handle MongoDB validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        res.status(400).json({
            status: 400,
            message: `Validation error: ${errors.join(', ')}`,
            data: null,
        });
        return;
    }

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        res.status(409).json({
            status: 409,
            message: `Duplicate ${field} already exists`,
            data: null,
        });
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            status: 401,
            message: 'Invalid token',
            data: null,
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            status: 401,
            message: 'Token expired',
            data: null,
        });
        return;
    }

    // Handle MongoDB connection errors
    if (err.name === 'MongooseServerSelectionError') {
        res.status(503).json({
            status: 503,
            message: 'Database connection error',
            data: null,
        });
        return;
    }

    // Handle CORS errors
    if (err.message && err.message.includes('CORS')) {
        res.status(403).json({
            status: 403,
            message: 'CORS policy violation',
            data: null,
        });
        return;
    }

    // Handle multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
            status: 400,
            message: 'File size too large',
            data: null,
        });
        return;
    }

    // Generic 500 error
    res.status(500).json({
        status: 500,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : 'Something went wrong',
        data: process.env.NODE_ENV === 'development' ? err.message : null,
    });
};
