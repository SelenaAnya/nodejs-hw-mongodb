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
    console.log('User in getContactsController:', req.user);

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

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
    console.log('User in getContactByIdController:', req.user);

    const { contactId } = req.params;

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    const contact = await getContactById(contactId, req.user._id);

    if (!contact) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};

export const createContactController = async (req, res) => {
    console.log('User in createContactController:', req.user);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    // Add the URL of the photo if the file was uploaded
    const contactData = {
        ...req.body,
        photo: req.file ? req.file.path : undefined
    };

    const contact = await createContact(contactData, req.user._id);

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const patchContactController = async (req, res, next) => {
    console.log('User in patchContactController:', req.user);
    console.log('Uploaded file:', req.file);

    const { contactId } = req.params;

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    // Add the photo URL to the update data if the file was uploaded
    const updateData = {
        ...req.body,
        ...(req.file && { photo: req.file.path })
    };

    const result = await updateContact(contactId, updateData, req.user._id);

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
    console.log('User in deleteContactController:', req.user);

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
