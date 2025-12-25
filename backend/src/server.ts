import { createServer } from 'http';
import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { initializeSocket } from './services/socketService';

const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Create HTTP server (required for Socket.IO)
        const httpServer = createServer(app);

        // Initialize Socket.IO
        initializeSocket(httpServer);

        // Start server
        httpServer.listen(config.port, () => {
            console.log(`\n🚀 Server running on port ${config.port}`);
            console.log(`📡 API endpoint: http://localhost:${config.port}/api`);
            console.log(`🔌 WebSocket: ws://localhost:${config.port}`);
            console.log(`🔧 Environment: ${config.nodeEnv}\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
