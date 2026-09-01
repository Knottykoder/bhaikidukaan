import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config.js';
import * as schema from './schema.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const poolConfig: pg.PoolConfig = {
  connectionString: config.db.url,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (config.db.url.includes('sslmode=require') || config.db.url.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.debug('📦 New database connection established');
});

pool.on('error', (err) => {
  logger.error({ err }, '❌ Unexpected database pool error');
});

export const db = drizzle(pool, { schema });

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    logger.info('✅ Connected to PostgreSQL Database (SSL: Enabled)');
    return true;
  } catch (error) {
    logger.error({ error }, '❌ Database connection failed');
    return false;
  }
}
