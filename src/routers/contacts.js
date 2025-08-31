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
import { uploadPhoto, handleUploadError } from '../middlewares/multer.js';
import {
    createContactSchema,
    updateContactSchema,
} from '../validation/contacts.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// Apply authenticate middleware to all routers
router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));

router.get(
    '/:contactId',
    isValidId,
    ctrlWrapper(getContactByIdController),
);

// Routing to create a contact with a photo
router.post(
    '/',
    uploadPhoto,
    handleUploadError,
    validateBody(createContactSchema),
    ctrlWrapper(createContactController),
);

router.patch(
    '/:contactId',
    isValidId,
    uploadPhoto,
    handleUploadError,
    validateBody(updateContactSchema),
    ctrlWrapper(patchContactController),
);

router.delete(
    '/:contactId',
    isValidId,
    ctrlWrapper(deleteContactController),
);

export default router;
