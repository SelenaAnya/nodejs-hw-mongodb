import dotenv from 'dotenv';
import { initMongoConnection } from './db/initMongoConnection.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';
import app from './server.js';


dotenv.config();

const bootstrap = async () => {
  try {
    console.log('Starting application bootstrap...');

    console.log('Connecting to MongoDB...');

    await initMongoConnection();
    console.log('✅ Database connection established');

    console.log('Creating upload directories...');

    await createDirIfNotExists(TEMP_UPLOAD_DIR);
    await createDirIfNotExists(UPLOAD_DIR);
    console.log('✅ Upload directories created');

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server successfully running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`API Docs (Swagger): http://localhost:${PORT}/api-docs`);
      console.log(`API Docs (ReDoc): http://localhost:${PORT}/docs`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log('Application started successfully!');
    });

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
};

bootstrap();
