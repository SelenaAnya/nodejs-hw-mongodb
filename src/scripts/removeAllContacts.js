import { writeContacts } from '../utils/writeContacts.js';

export const removeAllContacts = async () => {
    await writeContacts([]);
};

await removeAllContacts();
console.log('All contacts have been removed.');
