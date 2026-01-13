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
import { upload, handleUploadError } from '../middlewares/multer.js';
import {
    createContactSchema,
    updateContactSchema,
} from '../validation/contacts.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// Apply authenticate middleware to all routes
router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));

router.get(
    '/:contactId',
    isValidId,
    ctrlWrapper(getContactByIdController),
);

// Route to create a contact with photo upload
router.post(
    '/',
    upload.single('photo'),
    handleUploadError,
    validateBody(createContactSchema),
    ctrlWrapper(createContactController),
);

// Route to update a contact with photo upload
router.patch(
    '/:contactId',
    isValidId,
    upload.single('photo'),
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

router.post('/test-upload',
    upload.single('photo'),
    handleUploadError,
    (req, res) => {
        console.log('=== TEST UPLOAD DEBUG ===');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('========================');

        res.json({
            status: 200,
            message: 'Test upload successful',
            data: {
                body: req.body,
                file: req.file,
                hasFile: !!req.file,
                filename: req.file?.filename,
                path: req.file?.path,
                mimetype: req.file?.mimetype,
                size: req.file?.size
            }
        });
    }
);
