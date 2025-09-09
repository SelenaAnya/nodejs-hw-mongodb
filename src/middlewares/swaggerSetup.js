import swaggerUi from 'swagger-ui-express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load and serve OpenAPI documentation
export const setupSwaggerDocs = async (app) => {
    try {
        // Build the documentation first
        console.log('Building OpenAPI documentation...');

        // Path to the main OpenAPI file
        const openApiPath = path.join(process.cwd(), 'docs', 'openapi.yaml');

        // Check if the OpenAPI file exists
        try {
            await fs.access(openApiPath);
        } catch (error) {
            console.warn('OpenAPI file not found at:', openApiPath);
            return;
        }

        // Load the YAML file
        const yaml = await import('js-yaml');
        const yamlContent = await fs.readFile(openApiPath, 'utf8');
        const swaggerDocument = yaml.load(yamlContent);

        // Swagger UI options
        const options = {
            explorer: true,
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                displayOperationId: true,
            },
            customCss: `
                .swagger-ui .topbar { display: none; }
                .swagger-ui .info h1 { color: #32329f; }
                .swagger-ui .btn.authorize {
                    background-color: #32329f;
                    border-color: #32329f;
                }
                .swagger-ui .btn.authorize:hover {
                    background-color: #2a2a85;
                    border-color: #2a2a85;
                }
            `,
            customSiteTitle: 'Contacts API Documentation',
            customfavIcon: '/favicon.ico',
        };

        // Set up Swagger UI middleware
        app.use('/api-docs', swaggerUi.serve);
        app.get('/api-docs', swaggerUi.setup(swaggerDocument, options));

        // Redirect /docs to /api-docs for convenience
        app.get('/docs', (req, res) => {
            res.redirect('/api-docs');
        });

        console.log('✅ Swagger documentation available at: /api-docs');

    } catch (error) {
        console.error('Failed to setup Swagger documentation:', error);
    }
};

// Alternative setup using bundled JSON (if redocly build is available)
export const setupSwaggerFromBundle = async (app) => {
    try {
        const bundlePath = path.join(process.cwd(), 'docs', 'swagger.json');

        // Check if bundle exists
        try {
            await fs.access(bundlePath);
        } catch (error) {
            console.warn('No bundled documentation found. Using direct YAML approach.');
            return setupSwaggerDocs(app);
        }

        const bundleContent = await fs.readFile(bundlePath, 'utf8');
        const swaggerDocument = JSON.parse(bundleContent);

        const options = {
            explorer: true,
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
            },
            customCss: `
                .swagger-ui .topbar { display: none; }
                .swagger-ui .info h1 { color: #32329f; }
            `,
            customSiteTitle: 'Contacts API Documentation',
        };

        app.use('/api-docs', swaggerUi.serve);
        app.get('/api-docs', swaggerUi.setup(swaggerDocument, options));

        app.get('/docs', (req, res) => {
            res.redirect('/api-docs');
        });

        console.log('✅ Swagger documentation (bundled) available at: /api-docs');

    } catch (error) {
        console.error('Failed to setup bundled Swagger documentation:', error);
        // Fallback to direct YAML approach
        return setupSwaggerDocs(app);
    }
};
