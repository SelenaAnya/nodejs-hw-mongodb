import mongoose from 'mongoose';

const initMongoConnection = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL;

        if (!mongoUrl) {
            throw new Error('MONGODB_URL is not defined in environment variables');
        }

        await mongoose.connect(mongoUrl);

        console.log('Mongo connection successfully established!');
    } catch (error) {
        console.error('Error while setting up mongo connection:', error);
        throw error;
    }
};

export default initMongoConnection;
