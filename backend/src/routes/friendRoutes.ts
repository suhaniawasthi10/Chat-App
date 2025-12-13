import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { friendController } from '../controllers/friendController';

const router = Router();

router.post('/request', authMiddleware, friendController.sendRequest);
router.get('/requests', authMiddleware, friendController.getRequests);
router.post('/accept', authMiddleware, friendController.acceptRequest);
router.post('/reject', authMiddleware, friendController.rejectRequest);
router.get('/list', authMiddleware, friendController.listFriends);

export default router;
