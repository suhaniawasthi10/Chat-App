import { apiClient } from './client';

export const sendFriendRequest = async (toUserId: string) => {
    return apiClient('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ toUserId })
    });
};

export const getFriendRequests = async () => {
    return apiClient('/friends/requests');
};

export const acceptFriendRequest = async (requestId: string) => {
    return apiClient('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ requestId })
    });
};

export const rejectFriendRequest = async (requestId: string) => {
    return apiClient('/friends/reject', {
        method: 'POST',
        body: JSON.stringify({ requestId })
    });
};

export const getFriendsList = async () => {
    return apiClient('/friends/list');
};
