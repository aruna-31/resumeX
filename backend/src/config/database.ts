import { Sequelize, Options } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';
import { runMigrations } from '../scripts/migrate';

dotenv.config();

// NOTE: Do not throw at import-time. The server can run in a degraded mode
// (e.g., health checks) even if the database is temporarily unavailable.
const DATABASE_URL = process.env.DATABASE_URL;

// Parse the database URL
const dbUrl = DATABASE_URL ? new URL(DATABASE_URL) : null;

// Extract connection parameters
const dbConfig: Options = {
    database: dbUrl?.pathname.substring(1), // Remove leading slash
    username: dbUrl?.username,
    password: dbUrl?.password,
    host: dbUrl?.hostname,
    port: dbUrl?.port ? parseInt(dbUrl.port, 10) : undefined,
    dialect: 'postgres',
    dialectModule: pg,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: false,
        // paranoid: true, // Removed as tables don't support soft deletes yet
    },
    pool: {
        max: 10, // Increased for production
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 15000, // Close idle connections after 15 seconds
    },
    retry: {
        max: 3, // Maximum number of connection retries
    },
};

// Create Sequelize instance
export const sequelize = new Sequelize(dbConfig.database ?? '', dbConfig.username ?? '', dbConfig.password ?? '', {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectModule: dbConfig.dialectModule,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool,
});

// Track if the database is connected
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Establishes a connection to the database with retry logic
 */
export async function connectDB() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    if (isConnected) {
        return sequelize;
    }

    try {
        await sequelize.authenticate();
        isConnected = true;
        retryCount = 0;

        console.log('✅ Database connection established successfully.');

        if (process.env.NODE_ENV !== 'test') {
            await runMigrations(process.env.DATABASE_URL);
            console.log('✅ Database migrations applied.');
        }

        return sequelize;
    } catch (error) {
        retryCount++;

        if (retryCount < MAX_RETRIES) {
            console.error(`Database connection attempt ${retryCount} failed. Retrying in ${RETRY_DELAY / 1000} seconds...`, error);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectDB();
        }

        console.error('Failed to connect to the database after multiple attempts:', error);
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Gracefully close the database connection
 */
export const closeDB = async (): Promise<void> => {
    if (!isConnected) return;

    try {
        await sequelize.close();
        isConnected = false;
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
        throw error;
    }
};

// Handle process termination
process.on('SIGTERM', async () => {
    await closeDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

// Export types for better type safety
export type { Sequelize };
