import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple candidate paths for .env
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'services/user-service/.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

// ============================================
// Environment Configuration
// ============================================

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export const config = {
  // Server
  port: getEnvInt('GRPC_PORT', 50051),
  host: getEnv('GRPC_HOST', '0.0.0.0'),

  // Database
  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnvInt('DB_PORT', 5432),
    user: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD', 'postgres'),
    name: getEnv('DB_NAME', 'bhaikidukaan_users'),
    url: getEnv(
      'DATABASE_URL',
      'postgresql://postgres:postgres@localhost:5432/bhaikidukaan_users',
    ),
  },

  // JWT
  jwt: {
    accessSecret: getEnv('JWT_ACCESS_SECRET', 'bhai-ki-dukaan-access-secret-dev'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'bhai-ki-dukaan-refresh-secret-dev'),
    accessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // Service
  serviceName: 'user-service',
  env: getEnv('NODE_ENV', 'development'),
} as const;
