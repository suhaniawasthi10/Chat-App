import { io, Socket } from 'socket.io-client';
import { getToken } from './client';

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

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
