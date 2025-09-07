import createHttpError from 'http-errors';
import fs from 'fs/promises'; // ДОДАНО: імпорт fs
import {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
} from '../services/contacts.js';
import { uploadImage } from '../services/cloudinary.js'; // ДОДАНО: імпорт uploadImage
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
    console.log('=== CREATE CONTACT DEBUG ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('============================');

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    let photoUrl;

    // Handle photo upload
    if (req.file) {
        try {
            console.log('Uploading file to Cloudinary:', req.file.path);
            const uploadResult = await uploadImage(req.file.path);
            photoUrl = uploadResult.url;
            console.log('File uploaded to Cloudinary:', photoUrl);

            // Clean up temporary file
            await fs.unlink(req.file.path);
            console.log('Local file deleted:', req.file.path);
        } catch (error) {
            console.error('Cloudinary upload error:', error);

            // Clean up temp file on error
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting local file:', unlinkError);
            }
            throw createHttpError(500, 'Failed to upload image');
        }
    }

    const contactData = {
        ...req.body,
        ...(photoUrl && { photo: photoUrl })
    };

    console.log('Final contact data:', contactData);

    const contact = await createContact(contactData, req.user._id);

    console.log('Created contact:', contact);

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const patchContactController = async (req, res, next) => {
    console.log('=== PATCH CONTACT DEBUG ===');
    console.log('User:', req.user);
    console.log('Contact ID:', req.params.contactId);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('===========================');

    const { contactId } = req.params;

    if (!req.user || !req.user._id) {
        throw createHttpError(401, 'User not authenticated');
    }

    let photoUrl;

    // Handle photo upload
    if (req.file) {
        try {
            console.log('Uploading file to Cloudinary:', req.file.path);
            const uploadResult = await uploadImage(req.file.path);
            photoUrl = uploadResult.url;
            console.log('File uploaded to Cloudinary:', photoUrl);

            // Clean up temporary file
            await fs.unlink(req.file.path);
            console.log('Local file deleted:', req.file.path);
        } catch (error) {
            console.error('Cloudinary upload error:', error);

            // Clean up temp file on error
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting local file:', unlinkError);
            }
            throw createHttpError(500, 'Failed to upload image');
        }
    }

    const updateData = {
        ...req.body,
        ...(photoUrl && { photo: photoUrl })
    };

    console.log('Update data:', updateData);

    const result = await updateContact(contactId, updateData, req.user._id);

    if (!result) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    console.log('Updated contact:', result.contact);

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
