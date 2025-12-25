import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authLimiter, loginLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

export default router;
