import { BKD_TOPICS, getKafkaProducer, type PaymentEventType } from './config.js';
import { logger } from '../utils/logger.js';

export interface PaymentEventPayload {
  orderId: string;
  paymentId: string;
  razorpayOrderId?: string;
  amount: number;
  currency?: string;
  error?: string;
  timestamp: string;
}

export async function publishPaymentEvent(
  eventType: PaymentEventType,
  payload: PaymentEventPayload,
): Promise<boolean> {
  try {
    const producer = await getKafkaProducer();
    if (!producer) {
      logger.debug({ eventType, orderId: payload.orderId }, 'Kafka offline, skipping payment event publishing');
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
        source: 'payment-service',
      },
    };

    await producer.send({
      topic: BKD_TOPICS.PAYMENTS,
      messages: [message],
    });

    logger.info(
      { topic: BKD_TOPICS.PAYMENTS, eventType, orderId: payload.orderId, paymentId: payload.paymentId },
      '📢 Published Kafka Payment Event',
    );
    return true;
  } catch (err: any) {
    logger.warn({ err: err.message, eventType }, 'Failed to publish payment event to Kafka');
    return false;
  }
}
