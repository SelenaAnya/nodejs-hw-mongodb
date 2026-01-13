import multer from 'multer';
import createHttpError from 'http-errors';
import { TEMP_UPLOAD_DIR } from '../constants/index.js';

// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, TEMP_UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, `${uniqueSuffix}_${file.originalname}`);
    },
});

// File filter - allow only images
const fileFilter = (req, file, cb) => {
    console.log('File filter check:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    // Check MIME type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        const error = createHttpError(400, 'Only image files are allowed');
        cb(error, false);
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Middleware for handling upload errors
export const handleUploadError = (error, req, res, next) => {
    console.error('Upload error:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(createHttpError(400, 'File size too large. Maximum size is 5MB'));
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(createHttpError(400, 'Unexpected field name. Use "photo" field for file upload'));
        }
        return next(createHttpError(400, `Upload error: ${error.message}`));
    }

    next(error);
};
