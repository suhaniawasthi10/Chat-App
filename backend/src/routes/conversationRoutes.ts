import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { conversationController } from '../controllers/conversationController';

const router = Router();

router.post('/', authMiddleware, conversationController.createConversation);
router.get('/', authMiddleware, conversationController.getUserConversations);
router.get('/:id/messages', authMiddleware, conversationController.getConversationMessages);

export default router;
