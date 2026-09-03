import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { testConnection } from './db/index.js';

// Import handlers
import {
  createOrder,
  getOrder,
  listOrders,
  cancelOrder,
  updateOrderStatus,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from './handlers/order.js';

// ============================================
// Proto Loading
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../proto/order/v1/order.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,          // camelCase field names
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const orderProto = protoDescriptor.order.v1;

// ============================================
// gRPC Server
// ============================================

async function startServer(): Promise<void> {
  // Test database connection
  await testConnection();

  // Create gRPC server
  const server = new grpc.Server({
    'grpc.max_receive_message_length': 1024 * 1024 * 10, // 10MB
    'grpc.max_send_message_length': 1024 * 1024 * 10,
  });

  // Register OrderService handlers
  server.addService(orderProto.OrderService.service, {
    createOrder,
    getOrder,
    listOrders,
    cancelOrder,
    updateOrderStatus,
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  });

  // Bind and start
  const address = `${config.grpc.host}:${config.grpc.port}`;

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      logger.error({ err }, '❌ Failed to bind Order Service gRPC server');
      process.exit(1);
    }

    logger.info(`🚀 Order Service gRPC server running on port ${port}`);
    logger.info(`📡 Service: order.v1.OrderService`);
    logger.info(`🔗 Address: ${address}`);
    logger.info('');
    logger.info('Available RPCs:');
    logger.info('  ├─ CreateOrder');
    logger.info('  ├─ GetOrder');
    logger.info('  ├─ ListOrders');
    logger.info('  ├─ CancelOrder');
    logger.info('  ├─ UpdateOrderStatus');
    logger.info('  ├─ AddToCart');
    logger.info('  ├─ GetCart');
    logger.info('  ├─ UpdateCartItem');
    logger.info('  ├─ RemoveFromCart');
    logger.info('  └─ ClearCart');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n📴 Received ${signal}, shutting down gracefully...`);
    server.tryShutdown(async () => {
      logger.info('👋 Order Service stopped');
      process.exit(0);
    });

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
  logger.error({ err }, '💥 Failed to start Order Service');
  process.exit(1);
});
