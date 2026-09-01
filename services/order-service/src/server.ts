import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { testConnection } from './db/index.js';
import { initDatabase } from './db/init-db.js';

// Handlers
import {
  createOrder,
  getOrder,
  listOrders,
  cancelOrder,
  updateOrderStatus,
} from './handlers/order.js';

// ============================================
// Proto Loading
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../proto/order/v1/order.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false, // camelCase field names
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const orderProto = protoDescriptor.order.v1;

// ============================================
// gRPC Server Initialization
// ============================================

async function startServer(): Promise<void> {
  // Test Database Connection & Create Tables
  const dbOk = await testConnection();
  if (dbOk) {
    await initDatabase();
  }

  const server = new grpc.Server({
    'grpc.max_receive_message_length': 10 * 1024 * 1024,
    'grpc.max_send_message_length': 10 * 1024 * 1024,
  });

  // Register OrderService RPCs
  server.addService(orderProto.OrderService.service, {
    // Orders
    createOrder,
    getOrder,
    listOrders,
    cancelOrder,
    updateOrderStatus,

    // Dummy cart RPCs if invoked
    addToCart: (_c: any, cb: any) => cb(null, { cart: { items: [], totalItems: 0 } }),
    getCart: (_c: any, cb: any) => cb(null, { cart: { items: [], totalItems: 0 } }),
    updateCartItem: (_c: any, cb: any) => cb(null, { cart: { items: [], totalItems: 0 } }),
    removeFromCart: (_c: any, cb: any) => cb(null, { cart: { items: [], totalItems: 0 } }),
    clearCart: (_c: any, cb: any) => cb(null, { success: true }),
  });

  // Bind and Listen
  const bindAddress = `${config.grpc.host}:${config.grpc.port}`;
  server.bindAsync(
    bindAddress,
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
      if (err) {
        logger.fatal({ err }, '❌ Failed to bind gRPC server');
        process.exit(1);
      }

      logger.info(`🚀 Order Service gRPC server running on port ${port}`);
      logger.info(`📡 Service: order.v1.OrderService`);
      logger.info(`🔗 Address: ${bindAddress}`);
      logger.info('');
      logger.info('Available RPCs:');
      logger.info('  ├─ CreateOrder');
      logger.info('  ├─ GetOrder');
      logger.info('  ├─ ListOrders');
      logger.info('  ├─ CancelOrder');
      logger.info('  └─ UpdateOrderStatus');
    },
  );

  // Graceful Shutdown
  const shutdown = async () => {
    logger.info('🛑 Shutting down Order Service...');
    server.tryShutdown(async () => {
      logger.info('🔌 gRPC server stopped');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  logger.fatal({ err }, '💥 Fatal error starting Order Service');
  process.exit(1);
});
