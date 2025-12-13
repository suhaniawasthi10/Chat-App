import { apiClient } from './client';

export const getConversations = async () => {
    return apiClient('/conversations');
};

export const getMessages = async (conversationId: string, limit?: number, before?: string) => {
    let endpoint = `/conversations/${conversationId}/messages?limit=${limit || 50}`;
    if (before) {
        endpoint += `&before=${before}`;
    }
    return apiClient(endpoint);
};

export const createConversation = async (participantIds: string[], isGroup: boolean, name?: string) => {
    return apiClient('/conversations', {
        method: 'POST',
        body: JSON.stringify({ participantIds, isGroup, name })
    });
};
