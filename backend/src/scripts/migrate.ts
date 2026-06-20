import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '../../.env') });

const MIGRATIONS_DIR = join(
    __dirname,
    '../../../database/migrations'
);

export function splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inDollarBlock = false;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1] || '';

        if (inBlockComment) {
            current += char;
            if (char === '*' && nextChar === '/') {
                current += '/';
                i++;
                inBlockComment = false;
            }
            continue;
        }

        if (inLineComment) {
            current += char;
            if (char === '\n') {
                inLineComment = false;
            }
            continue;
        }

        if (!inSingleQuote && !inDoubleQuote && !inDollarBlock) {
            if (char === '/' && nextChar === '*') {
                current += '/*';
                i++;
                inBlockComment = true;
                continue;
            }
            if (char === '-' && nextChar === '-') {
                current += '--';
                i++;
                inLineComment = true;
                continue;
            }
        }

        if (char === "'" && !inDoubleQuote && !inDollarBlock) {
            inSingleQuote = !inSingleQuote;
        } else if (char === '"' && !inSingleQuote && !inDollarBlock) {
            inDoubleQuote = !inDoubleQuote;
        } else if (char === '$' && nextChar === '$' && !inSingleQuote && !inDoubleQuote) {
            current += '$$';
            i++;
            inDollarBlock = !inDollarBlock;
            continue;
        }

        if (char === ';' && !inSingleQuote && !inDoubleQuote && !inDollarBlock) {
            const stmt = current.trim();
            if (stmt) {
                statements.push(stmt);
            }
            current = '';
        } else {
            current += char;
        }
    }

    const remaining = current.trim();
    if (remaining) {
        statements.push(remaining);
    }

    return statements;
}

export async function runMigrations(
    connectionString?: string
): Promise<void> {

    const dbUrl =
        connectionString || process.env.DATABASE_URL;

    if (!dbUrl) {
        throw new Error('DATABASE_URL is not set');
    }

    const client = new Client({
        connectionString: dbUrl
    });

    await client.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        const files = readdirSync(MIGRATIONS_DIR)
            .filter((f) => f.endsWith('.sql'))
            .sort();

        for (const file of files) {

            const applied = await client.query(
                'SELECT 1 FROM schema_migrations WHERE name = $1',
                [file]
            );

            if ((applied.rowCount ?? 0) > 0) {
                console.log('[migrate] skip', file);
                continue;
            }

            const sql = readFileSync(
                join(MIGRATIONS_DIR, file),
                'utf8'
            );

            const statements = splitSqlStatements(sql);

            console.log('[migrate] applying', file);

            await client.query('BEGIN');

            try {

                for (let i = 0; i < statements.length; i++) {

                    console.log(
                        `Running statement ${i + 1}`
                    );

                    await client.query(statements[i]);

                    console.log(
                        `Completed statement ${i + 1}`
                    );
                }

                await client.query(
                    'INSERT INTO schema_migrations(name) VALUES($1)',
                    [file]
                );

                await client.query('COMMIT');

                console.log(
                    '[migrate] applied',
                    file
                );

            } catch (err) {

                console.log('Failed SQL:');
                console.log(statements);

                await client.query('ROLLBACK');

                throw err;
            }
        }

    } finally {
        await client.end();
    }
}