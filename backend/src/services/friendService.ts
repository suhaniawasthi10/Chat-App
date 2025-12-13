import { FriendRequest } from '../models/FriendRequest';
import { User } from '../models/User';
import { conversationService } from './conversationService';

export const friendService = {
    async sendFriendRequest(fromUserId: string, toUserId: string) {
        // Can't send request to yourself
        if (fromUserId === toUserId) {
            throw new Error('Cannot send friend request to yourself');
        }

        // Check if target user exists
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            throw new Error('User not found');
        }

        // Check if already friends
        const fromUser = await User.findById(fromUserId);
        if (fromUser?.friends.includes(toUserId as any)) {
            throw new Error('Already friends with this user');
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { from: fromUserId, to: toUserId, status: 'pending' },
                { from: toUserId, to: fromUserId, status: 'pending' }
            ]
        });

        if (existingRequest) {
            throw new Error('Friend request already exists');
        }

        // Create friend request
        const friendRequest = new FriendRequest({
            from: fromUserId,
            to: toUserId,
            status: 'pending'
        });

        await friendRequest.save();

        return {
            id: friendRequest._id,
            from: fromUserId,
            to: toUserId,
            status: friendRequest.status,
            createdAt: friendRequest.createdAt
        };
    },

    async getFriendRequests(userId: string) {
        const requests = await FriendRequest.find({
            to: userId,
            status: 'pending'
        }).populate('from', 'username email');

        return requests.map(req => ({
            id: req._id,
            from: {
                id: (req.from as any)._id,
                username: (req.from as any).username,
                email: (req.from as any).email
            },
            status: req.status,
            createdAt: req.createdAt
        }));
    },

    async acceptFriendRequest(requestId: string, userId: string) {
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            throw new Error('Friend request not found');
        }

        if (request.to.toString() !== userId) {
            throw new Error('Not authorized to accept this request');
        }

        if (request.status !== 'pending') {
            throw new Error('Request already processed');
        }

        // Update request status
        request.status = 'accepted';
        await request.save();

        // Add to each other's friends list
        await User.findByIdAndUpdate(request.from, {
            $addToSet: { friends: request.to }
        });

        await User.findByIdAndUpdate(request.to, {
            $addToSet: { friends: request.from }
        });

        // Create a private conversation
        await conversationService.createConversation(
            [request.from.toString(), request.to.toString()],
            false
        );

        return {
            id: request._id,
            status: request.status
        };
    },

    async rejectFriendRequest(requestId: string, userId: string) {
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            throw new Error('Friend request not found');
        }

        if (request.to.toString() !== userId) {
            throw new Error('Not authorized to reject this request');
        }

        if (request.status !== 'pending') {
            throw new Error('Request already processed');
        }

        request.status = 'rejected';
        await request.save();

        return {
            id: request._id,
            status: request.status
        };
    },

    async getFriendsList(userId: string) {
        const user = await User.findById(userId).populate('friends', 'username email');

        if (!user) {
            throw new Error('User not found');
        }

        return (user.friends as any[]).map(friend => ({
            id: friend._id,
            username: friend.username,
            email: friend.email
        }));
    }
};
