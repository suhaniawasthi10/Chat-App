import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService';
import { validate, createConversationSchema } from '../utils/validation';

export const conversationController = {
    async createConversation(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            const validation = validate(createConversationSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { participantIds, isGroup, name } = validation.data;

            // Include current user in participants
            if (!participantIds.includes(userId)) {
                participantIds.push(userId);
            }

            const result = await conversationService.createConversation(
                participantIds,
                isGroup,
                name
            );

            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async getUserConversations(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const conversations = await conversationService.getUserConversations(userId);
            res.json(conversations);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async getConversationMessages(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const { id } = req.params;
            const limit = parseInt(req.query.limit as string) || 50;
            const before = req.query.before as string;

            const messages = await messageService.getMessages(id, userId, limit, before);
            res.json(messages);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
