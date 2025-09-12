import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { swaggerDocs } from './middlewares/swaggerSetup.js';

// Initialising environment variables
dotenv.config();

// Getting the current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS settings
app.use(cors({
  origin: ['http://localhost:3000', 'https://hw7-swagger-lmoe.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.use('/api-docs', swaggerDocs());

app.use('/api', router);

app.get('/', (req, res) => {
  res.json({
    message: 'Contact Management API',
    version: '1.0.0',
    documentation: {
      swagger: `${req.protocol}://${req.get('host')}/api-docs`,
      redoc: `${req.protocol}://${req.get('host')}/docs`,
    },
    endpoints: {
      auth: `${req.protocol}://${req.get('host')}/api/auth`,
      contacts: `${req.protocol}://${req.get('host')}/api/contacts`,
    }
  });
});

// Redoc documentation (static HTML page)
app.get('/docs', (req, res) => {
  const redocHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Contact Management API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url="/docs/swagger.json"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
  `;
  res.send(redocHTML);
});

// JSON file for documentation
app.get('/docs/swagger.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/swagger.json'));
});


// Obrobka pomilok
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server successfully running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📚 API Docs (Swagger): http://localhost:${PORT}/api-docs`);
      console.log(`📚 API Docs (ReDoc): http://localhost:${PORT}/docs`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

// Starting the server only if it is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
