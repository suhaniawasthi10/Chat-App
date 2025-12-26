import { io, Socket } from 'socket.io-client';
import { getToken } from './client';

// Handle both relative (/api) and absolute URLs
const getSocketUrl = (): string => {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
    // If relative URL, use current origin
    if (apiUrl.startsWith('/')) {
        return window.location.origin;
    }
    // If absolute URL, remove /api suffix
    return apiUrl.replace('/api', '');
};

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (socket?.connected) {
        return socket;
    }

    const token = getToken();

    socket = io(SOCKET_URL, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('🔌 WebSocket connected');
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
    });

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const joinConversation = (conversationId: string): void => {
    if (socket?.connected) {
        socket.emit('join-conversation', conversationId);
    }
};

export const leaveConversation = (conversationId: string): void => {
    if (socket?.connected) {
        socket.emit('leave-conversation', conversationId);
    }
};

export const onNewMessage = (callback: (message: any) => void): void => {
    if (socket) {
        socket.on('new-message', callback);
    }
};

export const offNewMessage = (callback?: (message: any) => void): void => {
    if (socket) {
        if (callback) {
            socket.off('new-message', callback);
        } else {
            socket.off('new-message');
        }
    }
};
