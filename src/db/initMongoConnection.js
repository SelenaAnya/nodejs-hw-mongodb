import mongoose from 'mongoose';
import { env } from '../utils/env.js';

export const initMongoConnection = async () => {
    try {
        // Use the complete MongoDB URL from environment variables
        const mongoUrl = env('MONGODB_URL');

        console.log('Connecting to MongoDB...');
        console.log('MongoDB URL configured:', mongoUrl ? '✅ Yes' : '❌ No');

        await mongoose.connect(mongoUrl, {
            // Optional: Add connection options for better reliability
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
        });

        console.log('Mongo connection successfully established!');
    } catch (error) {
        console.error('Error while setting up mongo connection:', error);
        throw error; // Re-throw to handle in calling code
    }
};
