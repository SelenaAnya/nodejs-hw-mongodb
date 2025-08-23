import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';
import {
    registerUserController,
    loginUserController,
    refreshUserController,
    logoutUserController
} from '../controllers/auth.js';

const router = Router();

// Тестовий роут для перевірки тіла запиту
router.post('/debug', (req, res) => {
    console.log('=== DEBUG ROUTE ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('==================');

    res.json({
        message: 'Debug info',
        headers: req.headers,
        body: req.body,
        contentType: req.get('Content-Type')
    });
});

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

export default router;
