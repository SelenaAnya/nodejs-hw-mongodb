const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Перевірка доступності файлів документації
router.get('/check-docs', (req, res) => {
    const docsPath = path.join(__dirname, '../docs');
    const files = ['swagger.json', 'openapi.yaml', 'index.html'];

    const status = {
        environment: process.env.NODE_ENV || 'development',
        baseUrl: req.protocol + '://' + req.get('host'),
        docsPath: docsPath,
        files: {}
    };

    files.forEach(file => {
        const filePath = path.join(docsPath, file);
        status.files[file] = {
            exists: fs.existsSync(filePath),
            path: filePath
        };

        if (status.files[file].exists) {
            const stats = fs.statSync(filePath);
            status.files[file].size = stats.size;
            status.files[file].modified = stats.mtime;
        }
    });

    res.json(status);
});

// Тестовий маршрут для JSON
router.get('/test-json', (req, res) => {
    try {
        const swaggerPath = path.join(__dirname, '../docs/swagger.json');
        const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
        const swaggerJson = JSON.parse(swaggerContent);

        res.json({
            success: true,
            message: 'JSON файл читається успішно',
            servers: swaggerJson.servers,
            pathsCount: Object.keys(swaggerJson.paths).length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Прямий доступ до HTML
router.get('/docs-direct', (req, res) => {
    const htmlPath = path.join(__dirname, '../docs/index.html');

    if (!fs.existsSync(htmlPath)) {
        return res.status(404).send('HTML файл не знайдено');
    }

    res.sendFile(htmlPath);
});

module.exports = router;
