import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import initMongoConnection from '../db/initMongoConnection.js';
import { ContactsCollection } from '../db/models/contact.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedContacts = async () => {
    try {
        console.log('Starting database connection...');
        await initMongoConnection();

        const contactsPath = path.join(__dirname, '../../contacts.json');
        console.log('Reading contacts from:', contactsPath);

        const contactsData = await fs.readFile(contactsPath, 'utf-8');
        const contacts = JSON.parse(contactsData);

        console.log('Found contacts to import:', contacts.length);

        const deleteResult = await ContactsCollection.deleteMany({});
        console.log('Deleted existing contacts:', deleteResult.deletedCount);


        const contactsToInsert = contacts.map(contact => {
            const contactWithoutId = { ...contact };
            delete contactWithoutId.id;
            return contactWithoutId;
        });

        const insertResult = await ContactsCollection.insertMany(contactsToInsert);
        console.log('Inserted contacts:', insertResult.length);

        console.log('Contacts successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding contacts:', error);
        process.exit(1);
    }
};

seedContacts();
