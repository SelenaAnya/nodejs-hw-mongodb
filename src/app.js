import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './utils/env.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
    const app = express();

    // Basic health check route
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Server is running!',
            timestamp: new Date().toISOString(),
        });
    });

    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());

    app.use(
        pino({
            transport: process.env.NODE_ENV !== 'production' ? {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            } : undefined,
        }),
    );

    // Use API routes
    app.use('/api', router);

    app.use('*', notFoundHandler);
    app.use(errorHandler);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`MongoDB URL configured: ${process.env.MONGODB_URL ? 'Yes' : 'No'}`);
    });

    return app;
};
