import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error occurred:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

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
        res.status(409).json({
            status: 409,
            message: 'Duplicate entry found',
            data: null,
        });
        return;
    }

    res.status(500).json({
        status: 500,
        message: 'Something went wrong',
        data: process.env.NODE_ENV === 'development' ? err.message : null,
    });
};
