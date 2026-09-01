import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export const config = {
  grpc: {
    port: getEnvInt('GRPC_PORT', 50053),
    host: getEnv('GRPC_HOST', '0.0.0.0'),
  },
  db: {
    url: getEnv('DATABASE_URL'),
  },
  services: {
    product: getEnv('PRODUCT_SERVICE_ADDRESS', 'localhost:50052'),
    payment: getEnv('PAYMENT_SERVICE_ADDRESS', 'localhost:50054'),
  },
  env: getEnv('NODE_ENV', 'development'),
  serviceName: 'order-service',
} as const;
