import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { authService } from '../services/authService';
import { validate, registerSchema, loginSchema } from '../utils/validation';

export const authController = {
    async register(req: AuthRequest, res: Response) {
        try {
            const validation = validate(registerSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { username, email, password } = validation.data;
            const result = await authService.register(username, email, password);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req: AuthRequest, res: Response) {
        try {
            const validation = validate(loginSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { username, password } = validation.data;
            const result = await authService.login(username, password);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
