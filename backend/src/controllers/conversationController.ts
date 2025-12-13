import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService';

export const conversationController = {
    async createConversation(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const { participantIds, isGroup, name } = req.body;

            if (!participantIds || !Array.isArray(participantIds)) {
                res.status(400).json({ error: 'participantIds array is required' });
                return;
            }

            // Include current user in participants
            if (!participantIds.includes(userId)) {
                participantIds.push(userId);
            }

            const result = await conversationService.createConversation(
                participantIds,
                isGroup || false,
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
