import { apiClient } from './client';

export const getUsers = async (query?: string) => {
    const endpoint = query ? `/users?q=${encodeURIComponent(query)}` : '/users';
    return apiClient(endpoint);
};

export const getProfile = async () => {
    return apiClient('/users/me');
};

export const updateProfile = async (data: { username?: string; email?: string }) => {
    return apiClient('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};
