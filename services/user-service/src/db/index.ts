import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import * as schema from './schema.js';

const { Pool } = pg;

// Detect SSL (Required for Neon and Cloud Postgres)
const isCloudDB =
  config.db.url.includes('neon.tech') ||
  config.db.url.includes('sslmode=require') ||
  config.db.url.includes('railway') ||
  config.db.url.includes('supabase');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.db.url,
  ssl: isCloudDB ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log connection events
pool.on('connect', () => {
  logger.debug('📦 New database connection established');
});

pool.on('error', (err) => {
  logger.error({ err }, '❌ Database pool error');
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

/**
 * Test database connection
 */
export async function connectDB(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info(`✅ Connected to PostgreSQL Database (SSL: ${isCloudDB ? 'Enabled' : 'Disabled'})`);
  } catch (error) {
    logger.error({ error }, '❌ Failed to connect to PostgreSQL');
    throw error;
  }
}

/**
 * Close database connection pool
 */
export async function disconnectDB(): Promise<void> {
  await pool.end();
  logger.info('🔌 Database connection pool closed');
}
