import { BKD_TOPICS, getKafkaProducer, type OrderEventType } from './config.js';
import { logger } from '../utils/logger.js';

export interface OrderEventPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod?: string;
  reason?: string;
  timestamp: string;
}

export async function publishOrderEvent(
  eventType: OrderEventType,
  payload: OrderEventPayload,
): Promise<boolean> {
  try {
    const producer = await getKafkaProducer();
    if (!producer) {
      logger.debug({ eventType, orderId: payload.orderId }, 'Kafka offline, skipping event publishing');
      return false;
    }

    const message = {
      key: payload.orderId,
      value: JSON.stringify({
        eventType,
        payload,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        eventType,
        source: 'order-service',
      },
    };

    await producer.send({
      topic: BKD_TOPICS.ORDERS,
      messages: [message],
    });

    logger.info(
      { topic: BKD_TOPICS.ORDERS, eventType, orderId: payload.orderId, orderNumber: payload.orderNumber },
      '📢 Published Kafka Order Event',
    );
    return true;
  } catch (err: any) {
    logger.warn({ err: err.message, eventType }, 'Failed to publish event to Kafka');
    return false;
  }
}
