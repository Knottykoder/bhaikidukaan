import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from user-service
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_xGYZLOS2Cy4I@ep-curly-wind-axv12d42.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

export async function initializeDatabase(): Promise<void> {
  logger.info(`🚀 Connecting to PostgreSQL: ${dbUrl.split('@').pop()}`);

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    logger.info('📦 Creating tables: users, addresses, indexes...');

    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(50),
        "avatar_url" TEXT,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "label" VARCHAR(50) DEFAULT 'Home',
        "line1" VARCHAR(255) NOT NULL,
        "line2" VARCHAR(255),
        "city" VARCHAR(100) NOT NULL,
        "state" VARCHAR(100) NOT NULL,
        "pincode" VARCHAR(20) NOT NULL,
        "country" VARCHAR(100) DEFAULT 'India',
        "is_default" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
      CREATE INDEX IF NOT EXISTS "idx_addresses_user_id" ON "addresses"("user_id");
    `);

    logger.info('🎉 Neon PostgreSQL Tables initialized successfully!');
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize database schema');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute
initializeDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
