import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const removeLastContact = async () => {
    const contacts = await readContacts();
    if (contacts.length === 0) {
        return null;
    }

    const removedContact = contacts.pop();
    await writeContacts(contacts);
    return removedContact;
};

console.log(await removeLastContact());
