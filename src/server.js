import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './utils/env.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import contactsRouter from './routers/contacts.js';
import { UPLOAD_DIR } from './utils/constants.js';
import { swaggerDocs } from './middlewares/swaggerSetup.js';
import authRouter from './routers/auth.js';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
    const app = express();

    // Log all incoming requests for debugging
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress}`);
        next();
    });

    // Basic health check route
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Contacts API Server is running!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            endpoints: {
                api: '/api',
                health: '/health',
                docs: '/api'
            }
        });
    });

    // Health check endpoint (common for deployment platforms)
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    // Robots.txt to prevent unwanted crawling
    app.get('/robots.txt', (req, res) => {
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /api/\nDisallow: /auth/');
    });

    // Favicon.ico to prevent 404 errors
    app.get('/favicon.ico', (req, res) => {
        res.status(204).send();
    });

    // API status route
    app.get('/api', (req, res) => {
        res.status(200).json({
            message: 'Contacts API is working!',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            availableEndpoints: {
                auth: {
                    register: 'POST /api/auth/register',
                    login: 'POST /api/auth/login',
                    refresh: 'POST /api/auth/refresh',
                    logout: 'POST /api/auth/logout',
                    sendResetEmail: 'POST /api/auth/send-reset-email',
                    resetPassword: 'POST /api/auth/reset-pwd'
                },
                contacts: {
                    note: 'All contact endpoints require Authentication header: Bearer <token>',
                    getAll: 'GET /api/contacts',
                    getById: 'GET /api/contacts/:id',
                    create: 'POST /api/contacts (supports multipart/form-data for photo)',
                    update: 'PATCH /api/contacts/:id (supports multipart/form-data for photo)',
                    delete: 'DELETE /api/contacts/:id'
                }
            },
            usage: {
                authentication: 'Include "Authorization: Bearer <your-token>" header for contact endpoints',
                contentType: 'Use "Content-Type: application/json" for JSON data',
                fileUpload: 'Use "Content-Type: multipart/form-data" for file uploads'
            }
        });
    });

    // Middleware order is important!
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));

    // CORS configuration - more permissive for deployment
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, postman)
            if (!origin) return callback(null, true);

            // Allow any origin in development
            if (process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }

            // In production, allow specific origins
            const allowedOrigins = process.env.ALLOWED_ORIGINS
                ? process.env.ALLOWED_ORIGINS.split(',')
                : ['http://localhost:3000', 'https://localhost:3000'];

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow any https origin in production (for deployed frontends)
            if (origin.startsWith('https://')) {
                return callback(null, true);
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Handle CORS preflight requests
    app.options('*', cors());

    app.use(cookieParser());

    // Logging middleware - less verbose in production
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

    // Serve static files only in development or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.SERVE_STATIC === 'true') {
        app.use(express.static('project/public'));
        app.use('/css', express.static('project/css'));
    }

    // Main API router
    app.use('/api', router);

    // Catch common bot/crawler requests
    const botRoutes = [
        '/wp-admin', '/admin', '/administrator',
        '/wp-login.php', '/login.php', '/admin.php',
        '/.env', '/.git', '/config', '/phpmyadmin',
        '/xmlrpc.php', '/wp-content', '/uploads',
        '/sitemap.xml', '/sitemap_index.xml'
    ];

    botRoutes.forEach(route => {
        app.all(route, (req, res) => {
            console.log(`Bot/crawler attempt blocked: ${req.method} ${req.url} from ${req.ip}`);
            res.status(404).json({ error: 'Not found' });
        });
    });

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP'
    });

    app.use(limiter);

    // 404 handler for undefined routes - with better logging
    app.use('*', (req, res, next) => {
        console.log(`404 - Route not found: ${req.method} ${req.originalUrl} from ${req.ip || 'unknown'}`);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        next();
    }, notFoundHandler);

    // Global error handler (should be the last one)
    app.use(errorHandler);

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Started at: ${new Date().toISOString()}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`MongoDB URL configured: ${process.env.MONGODB_URL ? '✅ Yes' : '❌ No'}`);
        console.log(` API available at: http://localhost:${PORT}/api`);
        console.log(` Health check: http://localhost:${PORT}/health`);
        console.log('');
        console.log(' Available endpoints:');
        console.log('Authentication:');
        console.log(`      POST http://localhost:${PORT}/api/auth/register`);
        console.log(`      POST http://localhost:${PORT}/api/auth/login`);
        console.log(`      POST http://localhost:${PORT}/api/auth/refresh`);
        console.log(`      POST http://localhost:${PORT}/api/auth/logout`);
        console.log(`      POST http://localhost:${PORT}/api/auth/send-reset-email`);
        console.log(`      POST http://localhost:${PORT}/api/auth/reset-pwd`);
        console.log('   📱 Contacts (require authentication):');
        console.log(`      GET  http://localhost:${PORT}/api/contacts`);
        console.log(`      POST http://localhost:${PORT}/api/contacts`);
        console.log(`      GET  http://localhost:${PORT}/api/contacts/:id`);
        console.log(`      PATCH http://localhost:${PORT}/api/contacts/:id`);
        console.log(`      DELETE http://localhost:${PORT}/api/contacts/:id`);
        console.log('');
        console.log('💡 Use Authorization: Bearer <token> header for contact endpoints');
    });

      app.use('/auth', authRouter);

  app.use('/contacts', contactsRouter);
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use(notFoundHandler);
  app.use(errorHandler);
  app.listen(PORT, () =>
    console.log(`Web-server succsesfully running on ${PORT}  port`),
  );


    return app;
};
