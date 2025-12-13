import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { User } from '../models/User';
import { conversationService } from './conversationService';
import { webhookService } from './webhookService';

export const messageService = {
    async sendMessage(conversationId: string, senderId: string, text: string) {
        // Verify conversation exists and user is participant
        const conversation = await conversationService.getConversationById(conversationId, senderId);

        // Get sender details
        const sender = await User.findById(senderId);
        if (!sender) {
            throw new Error('Sender not found');
        }

        // Create message
        const message = new Message({
            conversation: conversationId,
            sender: senderId,
            text
        });

        await message.save();

        // Update conversation's last message
        conversation.lastMessage = {
            text,
            sender: senderId as any,
            timestamp: message.createdAt
        };
        await conversation.save();

        // Trigger webhook
        await webhookService.triggerMessageWebhook({
            conversationId,
            senderId,
            senderUsername: sender.username,
            text,
            timestamp: message.createdAt
        });

        return {
            id: message._id,
            conversation: message.conversation,
            sender: {
                id: sender._id,
                username: sender.username
            },
            text: message.text,
            createdAt: message.createdAt
        };
    },

    async getMessages(conversationId: string, userId: string, limit: number = 50, before?: string) {
        // Verify user is participant
        await conversationService.getConversationById(conversationId, userId);

        const query: any = { conversation: conversationId };

        if (before) {
            const beforeDate = new Date(before);
            query.createdAt = { $lt: beforeDate };
        }

        const messages = await Message.find(query)
            .populate('sender', 'username email')
            .sort({ createdAt: -1 })
            .limit(limit);

        return messages.reverse().map(msg => ({
            id: msg._id,
            conversation: msg.conversation,
            sender: {
                id: (msg.sender as any)._id,
                username: (msg.sender as any).username,
                email: (msg.sender as any).email
            },
            text: msg.text,
            createdAt: msg.createdAt
        }));
    }
};
