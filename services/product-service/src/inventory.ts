import mongoose from 'mongoose';
import { ProductModel } from './db/models/product.model.js';
import { FALLBACK_PRODUCTS } from './db/fallback-data.js';
import { logger } from './utils/logger.js';

function isMongoReady(): boolean {
  return mongoose.connection.readyState === 1;
}

export interface StockUpdateResult {
  success: boolean;
  productId: string;
  newStock: number;
}

export async function applyStockDelta(
  productId: string,
  quantityDelta: number,
): Promise<StockUpdateResult | null> {
  if (!productId || !Number.isFinite(quantityDelta) || quantityDelta === 0) {
    return null;
  }

  if (isMongoReady()) {
    const isObjId = mongoose.Types.ObjectId.isValid(productId);
    const query = isObjId
      ? { _id: productId }
      : { $or: [{ slug: productId }, { name: productId }] };

    const product = await ProductModel.findOne(query).exec();
    if (product) {
      product.stock = Math.max(0, Number(product.stock || 0) + quantityDelta);
      await product.save();
      logger.info(
        { productId, newStock: product.stock, quantityDelta },
        '📉 Stock updated in MongoDB',
      );
      return { success: true, productId, newStock: product.stock };
    }
  }

  const prod = FALLBACK_PRODUCTS.find(
    (p) => p.id === productId || p.slug === productId || p.name === productId,
  );
  if (prod) {
    prod.stock = Math.max(0, prod.stock + quantityDelta);
    logger.info({ productId, newStock: prod.stock, quantityDelta }, '📉 Stock updated in catalog');
    return { success: true, productId, newStock: prod.stock };
  }

  logger.warn({ productId, quantityDelta }, '⚠️ Product not found for stock update');
  return null;
}
