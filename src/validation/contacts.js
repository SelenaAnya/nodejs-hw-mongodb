import Joi from 'joi';

export const createContactSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name must be no more than 50 characters long',
            'any.required': 'Name is required'
        }),
    phoneNumber: Joi.string()
        .min(10)
        .max(20)
        .pattern(/^[\+]?[\d\s\-\(\)]+$/)
        .required()
        .messages({
            'string.min': 'Phone number must be at least 10 characters long',
            'string.max': 'Phone number must be no more than 20 characters long',
            'string.pattern.base': 'Phone number format is invalid',
            'any.required': 'Phone number is required'
        }),
    email: Joi.string()
        .email()
        .max(50)
        .optional()
        .allow('')
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email must be no more than 50 characters long'
        }),
    isFavourite: Joi.boolean()
        .optional(),
    contactType: Joi.string()
        .valid('work', 'home', 'personal')
        .default('personal')
        .messages({
            'any.only': 'Contact type must be one of: work, home, personal'
        }),
    photo: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'Photo must be a valid URL'
        }),
});

export const updateContactSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name must be no more than 50 characters long'
        }),
    phoneNumber: Joi.string()
        .min(10)
        .max(20)
        .pattern(/^[\+]?[\d\s\-\(\)]+$/)
        .optional()
        .messages({
            'string.min': 'Phone number must be at least 10 characters long',
            'string.max': 'Phone number must be no more than 20 characters long',
            'string.pattern.base': 'Phone number format is invalid'
        }),
    email: Joi.string()
        .email()
        .max(50)
        .optional()
        .allow('')
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email must be no more than 50 characters long'
        }),
    isFavourite: Joi.boolean()
        .optional(),
    contactType: Joi.string()
        .valid('work', 'home', 'personal')
        .optional()
        .messages({
            'any.only': 'Contact type must be one of: work, home, personal'
        }),
    photo: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'Photo must be a valid URL'
        }),
}).min(1).messages({
    'object.min': 'At least one field is required for update'
});
