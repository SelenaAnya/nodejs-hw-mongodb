import { v2 as cloudinary } from 'cloudinary';
import { env } from '../utils/env.js';

// Cloudinary configuration
cloudinary.config({
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
    api_key: env('CLOUDINARY_API_KEY'),
    api_secret: env('CLOUDINARY_API_SECRET'),
});

// Upload image from buffer to Cloudinary
export const uploadImageFromBuffer = async (buffer, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'contacts',
            use_filename: false,
            unique_filename: true,
            overwrite: false,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        };

        const uploadOptions = { ...defaultOptions, ...options };

        // Upload buffer to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        console.log('Image uploaded successfully to Cloudinary:', result.secure_url);
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

// Uploading the image to Cloudinary (legacy method for file path)
export const uploadImage = async (filePath, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'contacts',
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
