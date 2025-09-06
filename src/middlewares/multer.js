import multer from 'multer';
import createHttpError from 'http-errors';
import { uploadImageFromBuffer } from '../services/cloudinary.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

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
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Middleware for uploading a single file with the 'photo' field
export const uploadPhoto = upload.single('photo');

// Middleware for processing uploaded file and uploading to Cloudinary
export const processPhotoUpload = async (req, res, next) => {
    try {
        // If no file was uploaded, continue
        if (!req.file) {
            return next();
        }

        console.log('Processing photo upload to Cloudinary...');
        console.log('File info:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Upload buffer to Cloudinary
        const result = await uploadImageFromBuffer(req.file.buffer, {
            folder: 'contacts',
            public_id: `contact_${Date.now()}`,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        // Replace file path with Cloudinary URL
        req.file.path = result.url;
        req.file.cloudinary = {
            url: result.url,
            publicId: result.publicId
        };

        console.log('Photo uploaded to Cloudinary successfully:', result.url);
        next();
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        next(createHttpError(500, 'Failed to upload photo. Please try again.'));
    }
};

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
