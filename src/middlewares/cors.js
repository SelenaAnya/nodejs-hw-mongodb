const cors = require('cors');

// CORS налаштування для документації
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        'https://hw7-swagger-lmoe.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Створюємо CORS middleware з налаштуваннями
const corsMiddleware = cors(corsOptions);

// Спеціальний middleware для документації
const docsMiddleware = (req, res, next) => {
    // Додаємо заголовки для статичних файлів документації
    if (req.path.startsWith('/docs/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Встановлюємо правильний Content-Type
        if (req.path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (req.path.endsWith('.yaml')) {
            res.setHeader('Content-Type', 'text/yaml');
        } else if (req.path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
    next();
};

module.exports = {
    corsOptions,
    corsMiddleware,
    docsMiddleware
};
