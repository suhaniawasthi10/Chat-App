import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { messageService } from '../services/messageService';
import { validate, sendMessageSchema } from '../utils/validation';

export const messageController = {
    async sendMessage(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            const validation = validate(sendMessageSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { conversationId, text } = validation.data;
            const result = await messageService.sendMessage(conversationId, userId, text);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
