import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });

    if (err instanceof HttpError) {
        res.status(err.status).json({
            status: err.status,
            message: err.message,
            data: err.message,
        });
        return;
    }

    res.status(500).json({
        status: 500,
        message: 'Something went wrong',
        data: err.message,
    });
};
