import { v2 as cloudinary } from 'cloudinary';
import { env } from '../utils/env.js';

// Cloudinary configuration
cloudinary.config({
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_API_SECRET'),
});

// Uploading the image to Cloudinary
export const uploadImage = async (filePath, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'contacts', // Folder for organizing images
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        };

        const uploadOptions = { ...defaultOptions, ...options };
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);

        console.log('Image uploaded successfully:', result.secure_url);
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

// Delete an image from Cloudinary
export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted from Cloudinary:', result);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};

// Generate URL for image transformation
export const getTransformedImageUrl = (publicId, transformations = []) => {
    return cloudinary.url(publicId, {
        transformation: transformations
    });
};

export default cloudinary;
