import createHttpError from 'http-errors';
import mongoose from 'mongoose';

export const isValidId = (req, res, next) => {
    const { contactId } = req.params;

    if (!mongoose.isValidObjectId(contactId)) {
        next(createHttpError(400, 'Invalid contact ID format'));
        return;
    }

    next();
};
