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
  return process.env[key] ?? defaultValue ?? '';
}

function getEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

const INSECURE_JWT_DEFAULTS = new Set([
  'bhai-ki-dukaan-access-secret-dev',
  'bhai-ki-dukaan-access-secret-change-me',
  'bhai-ki-dukaan-access-secret-production-key-change-me',
]);

function jwtAccessSecret(): string {
  const value = process.env.JWT_ACCESS_SECRET;
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  if (isProd) {
    if (!value || INSECURE_JWT_DEFAULTS.has(value)) {
      throw new Error('JWT_ACCESS_SECRET must be a unique secret in production (do not use repo defaults)');
    }
    return value;
  }
  return value || 'bhai-ki-dukaan-access-secret-dev';
}

export const config = {
  port: getEnvInt('PORT', getEnvInt('GATEWAY_PORT', 4000)),
  host: getEnv('GATEWAY_HOST', '0.0.0.0'),
  jwt: {
    accessSecret: jwtAccessSecret(),
  },

  // gRPC Service addresses
  userServiceAddress: getEnv('USER_SERVICE_ADDRESS', 'localhost:50051'),
  productServiceAddress: getEnv('PRODUCT_SERVICE_ADDRESS', 'localhost:50052'),
  orderServiceAddress: getEnv('ORDER_SERVICE_ADDRESS', 'localhost:50053'),
  paymentServiceAddress: getEnv('PAYMENT_SERVICE_ADDRESS', 'localhost:50054'),

  // CORS
  corsOrigins: getEnv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000'),

  env: getEnv('NODE_ENV', 'development'),
  serviceName: 'gateway',
} as const;
