import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_DIR = path.resolve(__dirname, '../../../proto');

// ============================================
// User Service gRPC Client
// ============================================

const userProtoPath = path.join(PROTO_DIR, 'user/v1/user.proto');
const userPackageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR],
});
const userProto = grpc.loadPackageDefinition(userPackageDef) as any;

export const userServiceClient = new userProto.user.v1.UserService(
  config.userServiceAddress,
  grpc.credentials.createInsecure(),
);

logger.info(`📡 User Service gRPC client → ${config.userServiceAddress}`);

// ============================================
// Product Service gRPC Client
// ============================================

const productProtoPath = path.join(PROTO_DIR, 'product/v1/product.proto');
const productPackageDef = protoLoader.loadSync(productProtoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR],
});
const productProto = grpc.loadPackageDefinition(productPackageDef) as any;

export const productServiceClient = new productProto.product.v1.ProductService(
  config.productServiceAddress,
  grpc.credentials.createInsecure(),
);

logger.info(`📡 Product Service gRPC client → ${config.productServiceAddress}`);

// ============================================
// Order Service gRPC Client
// ============================================

const orderProtoPath = path.join(PROTO_DIR, 'order/v1/order.proto');
const orderPackageDef = protoLoader.loadSync(orderProtoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR],
});
const orderProto = grpc.loadPackageDefinition(orderPackageDef) as any;

export const orderServiceClient = new orderProto.order.v1.OrderService(
  config.orderServiceAddress,
  grpc.credentials.createInsecure(),
);

logger.info(`📡 Order Service gRPC client → ${config.orderServiceAddress}`);

// ============================================
// Payment Service gRPC Client
// ============================================

const paymentProtoPath = path.join(PROTO_DIR, 'payment/v1/payment.proto');
const paymentPackageDef = protoLoader.loadSync(paymentProtoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR],
});
const paymentProto = grpc.loadPackageDefinition(paymentPackageDef) as any;

export const paymentServiceClient = new paymentProto.payment.v1.PaymentService(
  config.paymentServiceAddress,
  grpc.credentials.createInsecure(),
);

logger.info(`📡 Payment Service gRPC client → ${config.paymentServiceAddress}`);

// ============================================
// Helper: Promisify gRPC unary calls
// ============================================

export function grpcCall<TReq, TRes>(
  client: any,
  method: string,
  request: TReq,
): Promise<TRes> {
  return new Promise((resolve, reject) => {
    client[method](request, (err: grpc.ServiceError | null, response: TRes) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}
