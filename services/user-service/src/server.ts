import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { connectDB, disconnectDB } from './db/index.js';

// Import handlers
import { register, login, refreshToken } from './handlers/auth.js';
import { getProfile, updateProfile } from './handlers/profile.js';
import { addAddress, updateAddress, deleteAddress } from './handlers/address.js';

// ============================================
// Proto Loading
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../proto/user/v1/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,          // camelCase field names
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const userProto = protoDescriptor.user.v1;

// ============================================
// gRPC Server
// ============================================

async function startServer(): Promise<void> {
  // Connect to database
  await connectDB();

  // Create gRPC server
  const server = new grpc.Server({
    'grpc.max_receive_message_length': 1024 * 1024 * 10, // 10MB
    'grpc.max_send_message_length': 1024 * 1024 * 10,
  });

  // Register UserService handlers
  server.addService(userProto.UserService.service, {
    // Auth
    register,
    login,
    refreshToken,
    // Profile
    getProfile,
    updateProfile,
    // Addresses
    addAddress,
    updateAddress,
    deleteAddress,
  });

  // Bind and start
  const address = `${config.host}:${config.port}`;

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      logger.error({ err }, '❌ Failed to bind gRPC server');
      process.exit(1);
    }

    logger.info(`🚀 User Service gRPC server running on port ${port}`);
    logger.info(`📡 Service: user.v1.UserService`);
    logger.info(`🔗 Address: ${address}`);
    logger.info('');
    logger.info('Available RPCs:');
    logger.info('  ├─ Register');
    logger.info('  ├─ Login');
    logger.info('  ├─ RefreshToken');
    logger.info('  ├─ GetProfile');
    logger.info('  ├─ UpdateProfile');
    logger.info('  ├─ AddAddress');
    logger.info('  ├─ UpdateAddress');
    logger.info('  └─ DeleteAddress');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n📴 Received ${signal}, shutting down gracefully...`);
    server.tryShutdown(async () => {
      await disconnectDB();
      logger.info('👋 User Service stopped');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.warn('⚠️ Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Start the server
startServer().catch((err) => {
  logger.error({ err }, '💥 Failed to start User Service');
  process.exit(1);
});
