import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Start server
        app.listen(config.port, () => {
            console.log(`\n🚀 Server running on port ${config.port}`);
            console.log(`📡 API endpoint: http://localhost:${config.port}/api`);
            console.log(`🔧 Environment: ${config.nodeEnv}\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
