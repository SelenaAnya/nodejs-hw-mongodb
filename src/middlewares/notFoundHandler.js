import createHttpError from "http-errors";

export const notFoundHandler = (req, res, next) => {
    // Check if it's likely a bot/crawler request
    const userAgent = req.get('User-Agent') || '';
    const isBot = /bot|crawler|spider|scraper|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent);

    // Common bot paths
    const commonBotPaths = [
        '/wp-admin', '/admin', '/administrator',
        '/wp-login.php', '/login.php', '/admin.php',
        '/.env', '/.git', '/config', '/phpmyadmin',
        '/xmlrpc.php', '/wp-content', '/uploads',
        '/favicon.ico', '/robots.txt', '/sitemap.xml'
    ];

    const isBotPath = commonBotPaths.some(path => req.url.startsWith(path));

    // If it's a bot or common bot path, return simple 404 without creating error
    if (isBot || isBotPath) {
        return res.status(404).json({
            status: 404,
            message: 'Not found'
        });
    }

    // For legitimate requests, provide helpful information
    const error = createHttpError(404, 'Route not found');

    // Add helpful context for API requests
    if (req.url.startsWith('/api')) {
        error.message = 'API endpoint not found';
        error.help = {
            availableEndpoints: [
                'GET /api - API documentation',
                'POST /api/auth/register - Register user',
                'POST /api/auth/login - Login user',
                'GET /api/contacts - Get contacts (requires auth)',
                'POST /api/contacts - Create contact (requires auth)'
            ],
            note: 'Contact endpoints require Authorization: Bearer <token> header'
        };
    }

    next(error);
};
