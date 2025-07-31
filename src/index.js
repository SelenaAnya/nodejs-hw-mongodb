import { config } from 'dotenv';
import { setupServer } from './server.js';
import initMongoConnection from './db/initMongoConnection.js';

config();

const bootstrap = async () => {
    await initMongoConnection();
    setupServer();
};

bootstrap();
