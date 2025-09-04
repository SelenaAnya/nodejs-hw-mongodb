import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import initMongoConnection from '../db/initMongoConnection.js';
import { ContactsCollection } from '../db/models/contact.js';
import { UsersCollection } from '../db/models/user.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedContacts = async () => {
    try {
        console.log('Starting database connection...');
        await initMongoConnection();

        // Create or find a test user
        let testUser = await UsersCollection.findOne({ email: 'test@example.com' });

        if (!testUser) {
            console.log('Creating test user...');
            const hashedPassword = await bcrypt.hash('password123', 10);
            testUser = await UsersCollection.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword
            });
            console.log('Test user created:', testUser._id);
        } else {
            console.log('Test user found:', testUser._id);
        }

        const contactsPath = path.join(__dirname, '../../contacts.json');
        console.log('Reading contacts from:', contactsPath);

        const contactsData = await fs.readFile(contactsPath, 'utf-8');
        const contacts = JSON.parse(contactsData);

        console.log('Found contacts to import:', contacts.length);

        // Delete existing contacts for test user only
        const deleteResult = await ContactsCollection.deleteMany({ userId: testUser._id });
        console.log('Deleted existing contacts for test user:', deleteResult.deletedCount);

        // Prepare contacts for insertion
        const contactsToInsert = contacts.map(contact => {
            const contactWithoutId = { ...contact };
            delete contactWithoutId.id;
            // Add a userId for each contact
            contactWithoutId.userId = testUser._id;
            return contactWithoutId;
        });

        const insertResult = await ContactsCollection.insertMany(contactsToInsert);
        console.log('Inserted contacts:', insertResult.length);

        console.log('Contacts successfully seeded!');
        console.log('Test user credentials:');
        console.log('Email: test@example.com');
        console.log('Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding contacts:', error);
        process.exit(1);
    }
};

seedContacts();
