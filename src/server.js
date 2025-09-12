import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import your routes
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';

const app = express();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://hw7-swagger-lmoe.onrender.com']
        : ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'project/public')));
app.use('/css', express.static(path.join(__dirname, 'project/css')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// Main API info endpoint
app.get('/api', (req, res) => {
    res.json({
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

// Serve HTML interface at /docs endpoint
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'project/public/index.html'));
});

// Serve reset password page
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'project/reset-password.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint - serve main interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'project/public/index.html'));
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Route not found',
        availableRoutes: [
            'GET /',
            'GET /docs',
            'GET /reset-password',
            'GET /api',
            'GET /health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/contacts'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main interface: http://localhost:${PORT}/`);
    console.log(`Documentation: http://localhost:${PORT}/docs`);
    console.log(`API endpoint: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
