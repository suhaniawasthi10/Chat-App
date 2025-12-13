import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { userService } from '../services/userService';

export const userController = {
    async getProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const user = await userService.getUserProfile(userId);
            res.json(user);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    },

    async listUsers(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const query = req.query.q as string;

            const users = query
                ? await userService.searchUsers(query, userId)
                : await userService.listUsers(userId);

            res.json(users);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
