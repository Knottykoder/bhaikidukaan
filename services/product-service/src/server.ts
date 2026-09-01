import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { connectDB, disconnectDB } from './db/index.js';

// Handlers
import {
  listProducts,
  getProduct,
  searchProducts,
  listCategories,
  getFeaturedProducts,
  createProduct,
  updateStock,
} from './handlers/product.js';

// ============================================
// Proto Loading
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../proto/product/v1/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false, // camelCase field names
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const productProto = protoDescriptor.product.v1;

// ============================================
// gRPC Server Initialization
// ============================================

async function startServer(): Promise<void> {
  // Connect to MongoDB
  await connectDB();

  // Create gRPC Server
  const server = new grpc.Server({
    'grpc.max_receive_message_length': 1024 * 1024 * 10,
    'grpc.max_send_message_length': 1024 * 1024 * 10,
  });

  // Register ProductService Handlers
  server.addService(productProto.ProductService.service, {
    listProducts,
    getProduct,
    searchProducts,
    listCategories,
    getFeaturedProducts,
    createProduct,
    updateStock,
  });

  // Bind and start
  const address = `${config.host}:${config.port}`;

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      logger.error({ err }, '❌ Failed to bind Product Service gRPC server');
      process.exit(1);
    }

    logger.info(`🚀 Product Service gRPC server running on port ${port}`);
    logger.info(`📡 Service: product.v1.ProductService`);
    logger.info(`🔗 Address: ${address}`);
    logger.info('');
    logger.info('Available RPCs:');
    logger.info('  ├─ ListProducts');
    logger.info('  ├─ GetProduct');
    logger.info('  ├─ SearchProducts');
    logger.info('  ├─ ListCategories');
    logger.info('  ├─ GetFeaturedProducts');
    logger.info('  ├─ CreateProduct');
    logger.info('  └─ UpdateStock');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n📴 Received ${signal}, shutting down Product Service gracefully...`);
    server.tryShutdown(async () => {
      await disconnectDB();
      logger.info('👋 Product Service stopped');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.warn('⚠️ Forcing Product Service shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  logger.error({ err }, '💥 Failed to start Product Service');
  process.exit(1);
});
