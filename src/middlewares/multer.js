import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../services/cloudinary.js';
import createHttpError from 'http-errors';

// Storage settings in Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'contacts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    },
});

// File filter - allow only images
const fileFilter = (req, file, cb) => {
    console.log('File filter check:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    // Перевіряємо MIME тип
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        const error = createHttpError(400, 'Only image files are allowed');
        cb(error, false);
    }
};

// Setting up a multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

// Middleware for uploading a single file with the 'photo' field
export const uploadPhoto = upload.single('photo');

// Middleware for download errors processing
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
