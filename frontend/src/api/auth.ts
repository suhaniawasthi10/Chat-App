import { apiClient, setToken } from './client';

export const register = async (username: string, email: string, password: string) => {
    const response = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    // Auto-login after registration
    if (response.token) {
        setToken(response.token);
    }
    return response;
};

export const login = async (username: string, password: string) => {
    return apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
};
