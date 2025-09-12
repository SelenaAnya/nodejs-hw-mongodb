const express = require('express');
const path = require('path');
const { corsMiddleware, docsMiddleware } = require('./middlewares/cors');
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const app = express();

// Застосовуємо CORS middleware
app.use(corsMiddleware);

// Застосовуємо спеціальний middleware для документації
app.use(docsMiddleware);

// Обслуговування статичних файлів документації
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Якщо використовуєте swagger-ui-express
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ваші інші маршрути...
app.use('/auth', require('./routes/auth'));
app.use('/contacts', require('./routes/contacts'));

// Діагностичні маршрути (для розробки)
if (process.env.NODE_ENV !== 'production') {
    app.use('/debug', require('./routes/debug'));
}

module.exports = app;
