import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Run database migrations
 * Creates tables if they don't exist
 */
async function runMigrations() {
  logger.info('🔄 Running database migrations...');

  const pool = new Pool({ connectionString: config.db.url });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    logger.info('✅ Migrations completed successfully');
  } catch (error) {
    logger.error({ error }, '❌ Migration failed');
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
