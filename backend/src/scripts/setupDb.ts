import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const baseConfig = dbUrl.split('/').slice(0, -1).join('/') + '/postgres';

async function setup() {
    console.log('--- Database Setup Utility ---');
    console.log('Target URL:', dbUrl);

    // Try to connect to default 'postgres' database first to create 'resumeX'
    const client = new Client({ connectionString: baseConfig });

    try {
        await client.connect();
        console.log('✅ Connected to Postgres server.');

        const dbName = dbUrl.split('/').pop() || 'resumeX';

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database "${dbName}"...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Database "${dbName}" created successfully.`);
        } else {
            console.log(`ℹ️ Database "${dbName}" already exists.`);
        }
    } catch (err: any) {
        console.error('❌ Failed to connect to Postgres.');
        console.error('Error Details:', err.message);
        console.log('\nPossible fixes:');
        console.log('1. Ensure Postgres service is running (cmd: net start postgresql-x64-15)');
        console.log('2. Check your password in backend/.env');
        console.log('3. Ensure your user has permissions to create databases.');
    } finally {
        await client.end();
    }
}

setup();
