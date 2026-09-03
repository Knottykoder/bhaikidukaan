import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';

// Import handlers
import {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus,
  refundPayment,
} from './handlers/payment.js';

// ============================================
// Proto Loading
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../../proto/payment/v1/payment.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,          // camelCase field names
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const paymentProto = protoDescriptor.payment.v1;

// ============================================
// gRPC Server
// ============================================

async function startServer(): Promise<void> {
  // Create gRPC server
  const server = new grpc.Server({
    'grpc.max_receive_message_length': 1024 * 1024 * 10, // 10MB
    'grpc.max_send_message_length': 1024 * 1024 * 10,
  });

  // Register PaymentService handlers
  server.addService(paymentProto.PaymentService.service, {
    createRazorpayOrder,
    verifyPayment,
    getPaymentStatus,
    refundPayment,
  });

  // Bind and start
  const address = `${config.grpc.host}:${config.grpc.port}`;

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      logger.error({ err }, '❌ Failed to bind Payment Service gRPC server');
      process.exit(1);
    }

    logger.info(`🚀 Payment Service gRPC server running on port ${port}`);
    logger.info(`📡 Service: payment.v1.PaymentService`);
    logger.info(`🔗 Address: ${address}`);
    logger.info('');
    logger.info('Available RPCs:');
    logger.info('  ├─ CreateRazorpayOrder');
    logger.info('  ├─ VerifyPayment');
    logger.info('  ├─ GetPaymentStatus');
    logger.info('  └─ RefundPayment');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n📴 Received ${signal}, shutting down gracefully...`);
    server.tryShutdown(async () => {
      logger.info('👋 Payment Service stopped');
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
  logger.error({ err }, '💥 Failed to start Payment Service');
  process.exit(1);
});
