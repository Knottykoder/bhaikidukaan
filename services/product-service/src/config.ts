import 'dotenv/config';

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
  port: getEnvInt('GRPC_PORT', 50052),
  host: getEnv('GRPC_HOST', '0.0.0.0'),

  // Database
  mongo: {
    uri: getEnv(
      'MONGODB_URI',
      'mongodb://localhost:27017/bhaikidukaan_products',
    ),
  },

  // Service
  serviceName: 'product-service',
  env: getEnv('NODE_ENV', 'development'),
} as const;
