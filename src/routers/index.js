import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';

const router = Router();

// Connect routers with the correct prefixes
router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);

export default router;
