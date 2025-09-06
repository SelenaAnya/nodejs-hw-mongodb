import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
    registerUserSchema,
    loginUserSchema,
    requestResetEmailSchema,
    resetPasswordSchema
} from '../validation/auth.js';
import {
    registerUserController,
    loginUserController,
    refreshUserController,
    logoutUserController,
    requestResetEmailController,
    resetPasswordController
} from '../controllers/auth.js';

const router = Router();

router.post(
    '/register',
    validateBody(registerUserSchema),
    ctrlWrapper(registerUserController),
);

router.post(
    '/login',
    validateBody(loginUserSchema),
    ctrlWrapper(loginUserController),
);

router.post(
    '/refresh',
    ctrlWrapper(refreshUserController),
);

router.post(
    '/logout',
    ctrlWrapper(logoutUserController),
);

router.post(
    '/send-reset-email',
    validateBody(requestResetEmailSchema),
    ctrlWrapper(requestResetEmailController),
);


router.post(
    '/reset-password',
    validateBody(resetPasswordSchema),
    ctrlWrapper(resetPasswordController),
);


router.get('/register', (req, res) => {
    res.json({
        message: 'Registration endpoint - use POST method',
        required_fields: ['name', 'email', 'password'],
        example: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        }
    });
});

export default router;
