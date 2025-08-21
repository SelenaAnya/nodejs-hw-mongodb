import { Router } from 'express';
import {
    getContactsController,
    getContactByIdController,
    createContactController,
    patchContactController,
    deleteContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { createContactSchema, updateContactSchema } from '../validation/contacts.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/contacts
router.get('/contacts', ctrlWrapper(getContactsController));

// GET /api/contacts/:contactId
router.get('/contacts/:contactId',
    isValidId,
    ctrlWrapper(getContactByIdController)
);

// POST /api/contacts
router.post('/contacts',
    validateBody(createContactSchema),
    ctrlWrapper(createContactController)
);

// PATCH /api/contacts/:contactId
router.patch('/contacts/:contactId',
    isValidId,
    validateBody(updateContactSchema),
    ctrlWrapper(patchContactController)
);

// DELETE /api/contacts/:contactId
router.delete('/contacts/:contactId',
    isValidId,
    ctrlWrapper(deleteContactController)
);

export default router;
