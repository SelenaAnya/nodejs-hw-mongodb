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
            environment: process.env.NODE_ENV || 'development',
        });
    });

    // API status route
    app.get('/api', (req, res) => {
        res.status(200).json({
            message: 'API is working!',
            version: '1.0.0',
            availableEndpoints: {
                auth: {
                    register: 'POST /api/auth/register',
                    login: 'POST /api/auth/login',
                    refresh: 'POST /api/auth/refresh',
                    logout: 'POST /api/auth/logout'
                },
                contacts: {
                    getAll: 'GET /api/contacts',
                    getById: 'GET /api/contacts/:id',
                    create: 'POST /api/contacts',
                    update: 'PATCH /api/contacts/:id',
                    delete: 'DELETE /api/contacts/:id'
                }
            }
        });
    });

    // Middleware order is important!
    app.use(express.json({ limit: '1mb' }));

    // CORS configuration
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
        credentials: true, // Allow cookies
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(cookieParser());

    // Logging middleware
    app.use(
        pino({
            transport: process.env.NODE_ENV !== 'production' ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            } : undefined,
        }),
    );

    // Use API routes
    app.use('/api', router);

    // 404 handler for undefined routes
    app.use('*', notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  MongoDB URL configured: ${process.env.MONGODB_URL ? '✅ Yes' : '❌ No'}`);
        console.log(`🌐 API available at: http://localhost:${PORT}/api`);
    });

    return app;
};
