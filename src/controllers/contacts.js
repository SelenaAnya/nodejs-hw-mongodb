import createHttpError from 'http-errors';
import {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getContactsController = async (req, res) => {
    console.log('User in getContactsController:', req.user); // Debug log

    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts({
        page,
        perPage,
        sortBy,
        sortOrder,
        filter,
        userId: req.user._id,
    });

    res.json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
    });
};

export const getContactByIdController = async (req, res, next) => {
    console.log('User in getContactByIdController:', req.user); // Debug log

    const { contactId } = req.params;
    const contact = await getContactById(contactId, req.user._id);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};

export const createContactController = async (req, res) => {
    console.log('User in createContactController:', req.user); // Debug log
    console.log('Request body:', req.body); // Debug log

    // Перевірка наявності користувача
    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    const contact = await createContact(req.body, req.user._id);

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const patchContactController = async (req, res, next) => {
    console.log('User in patchContactController:', req.user); // Debug log

    const { contactId } = req.params;

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    const result = await updateContact(contactId, req.body, req.user._id);

    if (!result) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.json({
        status: 200,
        message: 'Successfully patched a contact!',
        data: result.contact,
    });
};

export const deleteContactController = async (req, res, next) => {
    console.log('User in deleteContactController:', req.user); // Debug log

    const { contactId } = req.params;

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    const contact = await deleteContact(contactId, req.user._id);

    if (!contact) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.status(204).send();
};
