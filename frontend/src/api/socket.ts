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
let currentConversationId: string | null = null;
let messageCallback: ((message: any) => void) | null = null;

export const connectSocket = (): Socket => {
    // If already connected, return existing socket
    if (socket?.connected) {
        return socket;
    }

    // If socket exists but disconnected, disconnect fully first
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    const token = getToken();

    socket = io(SOCKET_URL, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']  // Prefer WebSocket
    });

    socket.on('connect', () => {
        console.log('🔌 WebSocket connected, socket id:', socket?.id);
        // Rejoin conversation room on reconnect
        if (currentConversationId) {
            console.log('🔄 Rejoining conversation:', currentConversationId);
            socket?.emit('join-conversation', currentConversationId);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
    });

    // Register the message listener immediately
    socket.on('new-message', (message: any) => {
        console.log('📨 New message received via WebSocket:', message);
        if (messageCallback) {
            messageCallback(message);
        }
    });

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
    currentConversationId = null;
    messageCallback = null;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const joinConversation = (conversationId: string): void => {
    currentConversationId = conversationId;

    if (socket?.connected) {
        console.log('📥 Joining conversation:', conversationId);
        socket.emit('join-conversation', conversationId);
    } else {
        console.log('⏳ Socket not connected yet, will join on connect');
        // Will join automatically when socket connects (see connect handler above)
    }
};

export const leaveConversation = (conversationId: string): void => {
    if (socket?.connected) {
        console.log('📤 Leaving conversation:', conversationId);
        socket.emit('leave-conversation', conversationId);
    }
    if (currentConversationId === conversationId) {
        currentConversationId = null;
    }
};

export const onNewMessage = (callback: (message: any) => void): void => {
    messageCallback = callback;
    console.log('🎧 Message listener registered');
};

export const offNewMessage = (): void => {
    messageCallback = null;
    console.log('🔇 Message listener removed');
};
