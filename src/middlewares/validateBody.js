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
        console.log('========================');

        const validatedData = await schema.validateAsync(req.body, {
            abortEarly: false,
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
