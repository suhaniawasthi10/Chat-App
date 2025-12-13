import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { messageService } from '../services/messageService';

export const messageController = {
    async sendMessage(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const { conversationId, text } = req.body;

            if (!conversationId || !text) {
                res.status(400).json({ error: 'conversationId and text are required' });
                return;
            }

            const result = await messageService.sendMessage(conversationId, userId, text);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
