import { apiClient } from './client';

export const register = async (username: string, email: string, password: string) => {
    return apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
};

export const login = async (username: string, password: string) => {
    return apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
};
