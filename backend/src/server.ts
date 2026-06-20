import dotenv from 'dotenv';
import http from 'http';
import { createApp } from './app';
import { connectDB, closeDB } from './config/database';
import { getEnv } from './config/env';

dotenv.config();

// Initialize the Express app
const app = createApp();

// Get port from environment or use 5000
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
let server: http.Server;

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error.name, error.message);

    // Close server and exit process
    if (server) {
        server.close(() => {
            console.log('Server closed due to uncaught exception');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

/**
 * Handle termination signals
 */
const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} signal received. Gracefully shutting down...`);

    try {
        await closeDB().catch(() => undefined);
        if (server) {
            server.close(async () => {
                console.log('✅ Server closed');
                console.log('👋 Shutdown complete. Goodbye!');
                process.exit(0);
            });

            // Force shutdown after 10 seconds if still not closed
            setTimeout(() => {
                console.error('Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
    try {
        console.log('🔥 Initializing ResumeX Production Engine...');

        const env = getEnv();
        if (!env.aiEnabled) {
            console.warn('⚠️  AI features disabled: set GEMINI_API_KEY and/or GROQ_API_KEY');
        }

        // Establish DB connection + migrations before accepting traffic.
        await connectDB();
        
        // Start the server
        server = app.listen(PORT, () => {
            console.log(`\n🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`📚 Health check: http://localhost:${PORT}/health`);
            console.log('🛑 Press CTRL+C to stop the server\n');
        });

        // Store the server instance in the app
        app.set('server', server);

        // Handle rejections
        process.on('unhandledRejection', (reason: any) => {
            console.error('UNHANDLED REJECTION! 💥', reason);
            if (server) {
                server.close(() => process.exit(1));
            } else {
                process.exit(1);
            }
        });

        // Termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('FATAL ERROR during server startup:', error);
        process.exit(1);
    }
};

// Start the application
startServer().catch(error => {
    console.error('FATAL: Failed to start server:', error);
    process.exit(1);
});
