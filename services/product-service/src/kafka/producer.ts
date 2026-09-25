import { BKD_TOPICS, getKafkaProducer, type InventoryEventType } from './config.js';
import { logger } from '../utils/logger.js';

export interface InventoryEventPayload {
  orderId: string;
  orderNumber?: string;
  productId: string;
  quantityDelta: number;
  newStock: number;
  timestamp: string;
}

export async function publishInventoryEvent(
  eventType: InventoryEventType,
  payload: InventoryEventPayload,
): Promise<boolean> {
  try {
    const producer = await getKafkaProducer();
    if (!producer) return false;

    await producer.send({
      topic: BKD_TOPICS.INVENTORY,
      messages: [
        {
          key: payload.productId,
          value: JSON.stringify({
            eventType,
            payload,
            timestamp: new Date().toISOString(),
          }),
          headers: {
            eventType,
            source: 'product-service',
          },
        },
      ],
    });

    logger.info(
      { topic: BKD_TOPICS.INVENTORY, eventType, productId: payload.productId, orderId: payload.orderId },
      '📢 Published Kafka Inventory Event',
    );
    return true;
  } catch (err: any) {
    logger.warn({ err: err.message, eventType }, 'Failed to publish inventory event to Kafka');
    return false;
  }
}
