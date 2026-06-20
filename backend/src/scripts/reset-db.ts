import dotenv from 'dotenv';
import { Client } from 'pg';
import { runMigrations } from './migrate';

dotenv.config();

const resetDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('Dropping application tables...');
    await client.query(`
      DROP TABLE IF EXISTS resume_versions CASCADE;
      DROP TABLE IF EXISTS resumes CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS jobs CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
    `);
    await client.end();

    console.log('Re-applying migrations...');
    await runMigrations(dbUrl);
    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
