import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';

// Handlers
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
  keepCase: false, // camelCase field names
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const paymentProto = protoDescriptor.payment.v1;

// ============================================
// gRPC Server Initialization
// ============================================

async function startServer(): Promise<void> {
  const server = new grpc.Server({
    'grpc.max_receive_message_length': 10 * 1024 * 1024,
    'grpc.max_send_message_length': 10 * 1024 * 1024,
  });

  // Register PaymentService RPCs
  server.addService(paymentProto.PaymentService.service, {
    createRazorpayOrder,
    verifyPayment,
    getPaymentStatus,
    refundPayment,
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

      logger.info(`🚀 Payment Service gRPC server running on port ${port}`);
      logger.info(`📡 Service: payment.v1.PaymentService`);
      logger.info(`🔗 Address: ${bindAddress}`);
      logger.info('');
      logger.info('Available RPCs:');
      logger.info('  ├─ CreateRazorpayOrder');
      logger.info('  ├─ VerifyPayment');
      logger.info('  ├─ GetPaymentStatus');
      logger.info('  └─ RefundPayment');
    },
  );

  // Graceful Shutdown
  const shutdown = async () => {
    logger.info('🛑 Shutting down Payment Service...');
    server.tryShutdown(async () => {
      logger.info('🔌 gRPC server stopped');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  logger.fatal({ err }, '💥 Fatal error starting Payment Service');
  process.exit(1);
});
