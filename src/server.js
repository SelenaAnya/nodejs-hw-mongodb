import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const PORT = Number(process.env.PORT) || 3000;

export const setupServer = () => {
    const app = express();

    // Basic health check route
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Server is running!',
            timestamp: new Date().toISOString(),
        });
    });

    // Logging middleware
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

    // CORS and JSON parsing
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // // API routes
    // app.use('/api', contactsRouter);
    // app.use('/auth', authRouter);

    // 404 handler for undefined routes
    app.use('*', notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`MongoDB URL configured: ${process.env.MONGODB_URL ? 'Yes' : 'No'}`);
    });

    return app;
};
