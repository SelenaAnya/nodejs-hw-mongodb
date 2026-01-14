import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
    try {
        console.log('=== VALIDATION DEBUG ===');
        console.log('Request method:', req.method);
        console.log('Request URL:', req.url);
        console.log('Content-Type:', req.get('Content-Type'));
        console.log('Raw body:', req.body);
        console.log('Body type:', typeof req.body);
        console.log('Body keys:', Object.keys(req.body || {}));
        console.log('Has file:', !!req.file);
        console.log('========================');

        // For multipart/form-data, convert string values to proper types
        const processedBody = { ...req.body };

        // Handle boolean fields that come as strings from multipart forms
        if (typeof processedBody.isFavourite === 'string') {
            if (processedBody.isFavourite.toLowerCase() === 'true') {
                processedBody.isFavourite = true;
            } else if (processedBody.isFavourite.toLowerCase() === 'false') {
                processedBody.isFavourite = false;
            }
        }

        // Remove empty string fields (optional fields)
        Object.keys(processedBody).forEach(key => {
            if (processedBody[key] === '') {
                delete processedBody[key];
            }
        });

        const validatedData = await schema.validateAsync(processedBody, {
            abortEarly: false,
            stripUnknown: true,
        });

        console.log('Validation successful:', validatedData);
        req.body = validatedData;
        next();
    } catch (error) {
        console.log('Validation failed:', error.details);
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        next(createHttpError(400, `Validation error: ${errorMessages}`));
    }
};
