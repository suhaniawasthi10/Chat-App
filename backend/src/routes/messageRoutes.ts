import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { messageController } from '../controllers/messageController';
import { messageLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/', authMiddleware, messageLimiter, messageController.sendMessage);

export default router;
