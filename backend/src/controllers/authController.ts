import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { authService } from '../services/authService';

export const authController = {
    async register(req: AuthRequest, res: Response) {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }

            const result = await authService.register(username, email, password);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req: AuthRequest, res: Response) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }

            const result = await authService.login(username, password);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
