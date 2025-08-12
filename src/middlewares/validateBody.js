import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
    try {
        const validatedData = await schema.validateAsync(req.body, {
            abortEarly: false,
        });
        req.body = validatedData;
        next();
    } catch (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        next(createHttpError(400, `Validation error: ${errorMessages}`));
    }
};
