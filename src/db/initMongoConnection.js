import mongoose from 'mongoose';
import { env } from '../utils/env.js';

export const initMongoConnection = async () => {
    try {
        // Use the complete MongoDB URL from environment variables
        const mongoUrl = env('MONGODB_URL');

        console.log('Connecting to MongoDB...');
        console.log('MongoDB URL configured:', mongoUrl ? '✅ Yes' : '❌ No');

        // Log the hostname for debugging (without credentials)
        const urlPattern = /mongodb+srv(?:\+srv)?:\/\/[^:]+:[^@]+@([^\/]+)/;
        const match = mongoUrl.match(urlPattern);
        if (match) {
            console.log('Attempting to connect to hostname:', match[1]);
        }

        await mongoose.connect(mongoUrl, {
            // Connection options for better reliability
            serverSelectionTimeoutMS: 15000, // 15 seconds (increased)
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 15000, // 15 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            retryWrites: true,
            w: 'majority'
        });

        console.log('Mongo connection successfully established!');
    } catch (error) {
        console.error('Error while setting up mongo connection:', error);

        if (error.message.includes('querySrv ENOTFOUND') || error.message.includes('ENOTFOUND')) {
            console.error('');
            console.error('DNS Resolution Error - Possible solutions:');
            console.error('1. Check your internet connection');
            console.error('2. Try using a different DNS server (8.8.8.8 or 1.1.1.1)');
            console.error('3. Get a fresh connection string from MongoDB Atlas');
            console.error('4. Try using a direct connection string instead of +srv');
            console.error('5. Check if your network/firewall is blocking MongoDB connections');
            console.error('');
        }

        if (error.message.includes('IP') && error.message.includes('whitelist')) {
            console.error('');
            console.error('IP ADDRESS NOT WHITELISTED - Solution:');
            console.error('1. Go to MongoDB Atlas (https://cloud.mongodb.com/)');
            console.error('2. Navigate to Network Access → IP Whitelist');
            console.error('3. Click "Add IP Address"');
            console.error('4. Either add your current IP or allow access from anywhere');
            console.error('5. Wait 1-2 minutes for changes to take effect');
            console.error('');
        }

        throw error; // Re-throw to handle in calling code
    }
};
