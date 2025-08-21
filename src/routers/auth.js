import { Router } from 'express';
import {
    registerUserController,
    loginUserController,
    refreshUserSessionController,
    logoutUserController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';

const router = Router();

// POST /auth/register
router.post('/register',
    validateBody(registerUserSchema),
    ctrlWrapper(registerUserController)
);

// POST /auth/login
router.post('/login',
    validateBody(loginUserSchema),
    ctrlWrapper(loginUserController)
);

// POST /auth/refresh
router.post('/refresh',
    ctrlWrapper(refreshUserSessionController)
);

// POST /auth/logout
router.post('/logout',
    ctrlWrapper(logoutUserController)
);

export default router;
