import { config } from 'dotenv';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js'; // ✅ Fixed - import as named export

// Load environment variables
config();

const bootstrap = async () => {
    try {
        console.log('Starting application bootstrap...');

        // Initialize MongoDB connection
        await initMongoConnection();
        console.log('Database connection established');

        // Setup and start server
        setupServer();
        console.log('Server setup completed');

    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
bootstrap();
