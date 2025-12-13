import { Conversation } from '../models/Conversation';
import { User } from '../models/User';

export const conversationService = {
    async createConversation(participantIds: string[], isGroup: boolean, name?: string) {
        // Validate participants exist
        const users = await User.find({ _id: { $in: participantIds } });
        if (users.length !== participantIds.length) {
            throw new Error('One or more participants not found');
        }

        // For private chats, check if conversation already exists
        if (!isGroup && participantIds.length === 2) {
            const existing = await Conversation.findOne({
                isGroup: false,
                participants: { $all: participantIds, $size: 2 }
            });

            if (existing) {
                return {
                    id: existing._id,
                    participants: existing.participants,
                    isGroup: existing.isGroup,
                    name: existing.name,
                    lastMessage: existing.lastMessage,
                    createdAt: existing.createdAt
                };
            }
        }

        // Create conversation
        const conversation = new Conversation({
            participants: participantIds,
            isGroup,
            name: isGroup ? name : undefined
        });

        await conversation.save();

        return {
            id: conversation._id,
            participants: conversation.participants,
            isGroup: conversation.isGroup,
            name: conversation.name,
            lastMessage: conversation.lastMessage,
            createdAt: conversation.createdAt
        };
    },

    async getUserConversations(userId: string) {
        const conversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'username email lastActive')
            .populate('lastMessage.sender', 'username')
            .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

        return conversations.map(conv => ({
            id: conv._id,
            participants: (conv.participants as any[]).map(p => ({
                id: p._id,
                username: p.username,
                email: p.email,
                lastActive: p.lastActive
            })),
            isGroup: conv.isGroup,
            name: conv.name,
            lastMessage: conv.lastMessage && conv.lastMessage.sender ? {
                text: conv.lastMessage.text,
                sender: {
                    id: (conv.lastMessage.sender as any)._id,
                    username: (conv.lastMessage.sender as any).username
                },
                timestamp: conv.lastMessage.timestamp
            } : undefined,
            createdAt: conv.createdAt
        }));
    },

    async getConversationById(conversationId: string, userId: string) {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Verify user is a participant
        if (!conversation.participants.some(p => p.toString() === userId)) {
            throw new Error('Not authorized to access this conversation');
        }

        return conversation;
    }
};
