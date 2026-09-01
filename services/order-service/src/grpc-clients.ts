import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_DIR = path.resolve(__dirname, '../../../proto');

// Product Service gRPC Client
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
  config.services.product,
  grpc.credentials.createInsecure(),
);

logger.info(`📡 Product Service Client in Order-Service → ${config.services.product}`);

export function updateProductStock(productId: string, quantityDelta: number): Promise<any> {
  return new Promise((resolve) => {
    productServiceClient.updateStock(
      { productId, quantityDelta },
      (err: any, response: any) => {
        if (err) {
          logger.warn({ err: err.message, productId }, '⚠️ Failed to decrease product stock via gRPC');
          resolve(null);
        } else {
          logger.info({ productId, newStock: response?.newStock }, '📉 Product stock decremented successfully');
          resolve(response);
        }
      },
    );
  });
}
