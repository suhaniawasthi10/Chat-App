import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { friendService } from '../services/friendService';
import { validate, sendFriendRequestSchema, handleFriendRequestSchema } from '../utils/validation';

export const friendController = {
    async sendRequest(req: AuthRequest, res: Response) {
        try {
            const fromUserId = req.userId!;

            const validation = validate(sendFriendRequestSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { toUserId } = validation.data;
            const result = await friendService.sendFriendRequest(fromUserId, toUserId);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async getRequests(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const requests = await friendService.getFriendRequests(userId);
            res.json(requests);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async acceptRequest(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            const validation = validate(handleFriendRequestSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { requestId } = validation.data;
            const result = await friendService.acceptFriendRequest(requestId, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async rejectRequest(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;

            const validation = validate(handleFriendRequestSchema, req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { requestId } = validation.data;
            const result = await friendService.rejectFriendRequest(requestId, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async listFriends(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId!;
            const friends = await friendService.getFriendsList(userId);
            res.json(friends);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};
