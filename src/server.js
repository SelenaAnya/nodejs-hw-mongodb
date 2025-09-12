// import express from 'express';
// import pino from 'pino-http';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import rateLimit from 'express-rate-limit';

// import { env } from './utils/env.js';
// import router from './routers/index.js';
// import { errorHandler } from './middlewares/errorHandler.js';
// import { notFoundHandler } from './middlewares/notFoundHandler.js';
// import contactsRouter from './routers/contacts.js';
// import { swaggerDocs } from './middlewares/swaggerSetup.js';
// import authRouter from './routers/auth.js';


const express = require('express');
const path = require('path');
const app = express();

// Обслуговування статичних файлів для документації
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Альтернативно, якщо використовуєте swagger-ui-express
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

// Налаштування для production
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        // Вказати правильний URL для production
        urls: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://hw7-swagger-lmoe.onrender.com/docs/swagger.json'
                    : 'http://localhost:3000/docs/swagger.json',
                name: 'Contact API'
            }
        ]
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Маршрут для OpenAPI JSON
app.get('/docs/swagger.json', (req, res) => {
    res.json(swaggerDocument);
});

// Маршрут для OpenAPI YAML (якщо потрібен)
app.get('/docs/openapi.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'openapi.yaml'));
});
