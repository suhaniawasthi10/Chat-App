import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

let io: Server | null = null;

interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
}

export const initializeSocket = (httpServer: HttpServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // In production, specify your frontend URL
            methods: ['GET', 'POST']
        }
    });

    // Authentication middleware
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = decoded.userId;
            socket.username = user.username;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

        // Join a conversation room
        socket.on('join-conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`👤 ${socket.username} joined conversation: ${conversationId}`);
        });

        // Leave a conversation room
        socket.on('leave-conversation', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`👤 ${socket.username} left conversation: ${conversationId}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.username}`);
        });
    });

    console.log('🔌 Socket.IO initialized');
    return io;
};

// Get the Socket.IO instance
export const getIO = (): Server | null => {
    return io;
};

// Emit a new message to a conversation room
export const emitNewMessage = (conversationId: string, message: any): void => {
    if (io) {
        io.to(`conversation:${conversationId}`).emit('new-message', message);
        console.log(`📨 Message emitted to conversation: ${conversationId}`);
    }
};
