import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerDocs = () => {
  try {
    const swaggerPath = path.resolve(__dirname, "../../docs/swagger.json");

    if (!fs.existsSync(swaggerPath)) {
      console.error('Swagger JSON file not found at:', swaggerPath);
      return [(req, res, next) => {
        next(createHttpError(404, "Swagger documentation not found"));
      }];
    }

    const doc = JSON.parse(
      fs.readFileSync(swaggerPath, { encoding: "utf-8" })
    );

    console.log('Swagger documentation loaded successfully');

    const options = {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "Contact Management API - Swagger UI",
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      }
    };

    return [...swaggerUI.serve, swaggerUI.setup(doc, options)];

  } catch (error) {
    console.error('Error loading swagger docs:', error.message);
    return [(req, res, next) => {
      next(createHttpError(500, `Cannot load swagger docs: ${error.message}`));
    }];
  }
};
