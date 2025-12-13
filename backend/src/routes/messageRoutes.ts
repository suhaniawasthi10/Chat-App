import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { messageController } from '../controllers/messageController';

const router = Router();

router.post('/', authMiddleware, messageController.sendMessage);

export default router;
