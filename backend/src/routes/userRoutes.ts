import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { userController } from '../controllers/userController';

const router = Router();

router.get('/me', authMiddleware, userController.getProfile);
router.get('/', authMiddleware, userController.listUsers);

export default router;
