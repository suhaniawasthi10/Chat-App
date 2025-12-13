import { apiClient } from './client';

export const sendMessage = async (conversationId: string, text: string) => {
    return apiClient('/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, text })
    });
};
