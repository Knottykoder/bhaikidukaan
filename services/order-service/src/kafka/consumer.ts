import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orders } from '../db/schema.js';
import { logger } from '../utils/logger.js';
import { BKD_TOPICS, getKafkaConsumer, isKafkaStopRequested, markConsumerDisconnected } from './config.js';

const processedEvents = new Set<string>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePaymentEvent(raw: string | undefined): {
  eventType: string;
  payload: {
    orderId?: string;
    paymentId?: string;
    razorpayOrderId?: string;
    error?: string;
  };
} | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      eventType: parsed.eventType,
      payload: parsed.payload || {},
    };
  } catch {
    return null;
  }
}

async function handlePaymentEvent(raw: string | undefined): Promise<void> {
  const event = parsePaymentEvent(raw);
  if (!event) return;

  const { eventType, payload } = event;
  if (eventType !== 'PAYMENT_COMPLETED' && eventType !== 'PAYMENT_FAILED') return;

  const orderId = payload.orderId || '';
  const paymentId = payload.paymentId || '';
  if (!orderId && !paymentId) return;

  const idempotencyKey = `${eventType}:${orderId || paymentId}`;
  if (processedEvents.has(idempotencyKey)) {
    logger.debug({ idempotencyKey }, 'Skipping already processed payment event');
    return;
  }
  processedEvents.add(idempotencyKey);

  try {
    const existing = orderId
      ? await db.query.orders.findFirst({ where: eq(orders.id, orderId) })
      : await db.query.orders.findFirst({ where: eq(orders.paymentId, paymentId) });
    if (!existing) {
      logger.debug({ orderId, paymentId, eventType }, 'No matching order yet for payment event');
      processedEvents.delete(idempotencyKey);
      return;
    }

    if (existing.status === 'CANCELLED' || existing.status === 'ORDER_STATUS_CANCELLED') {
      logger.info({ orderId: existing.id, eventType }, 'Ignoring payment event for cancelled order');
      return;
    }

    const nextStatus = eventType === 'PAYMENT_COMPLETED' ? 'PROCESSING' : existing.status;
    const notes =
      eventType === 'PAYMENT_FAILED'
        ? [existing.notes, payload.error || 'Payment verification failed'].filter(Boolean).join(' | ')
        : existing.notes;

    await db
      .update(orders)
      .set({
        status: nextStatus,
        paymentId: paymentId || existing.paymentId,
        razorpayOrderId: payload.razorpayOrderId || existing.razorpayOrderId,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, existing.id));

    logger.info(
      { orderId: existing.id, orderNumber: existing.orderNumber, eventType, status: nextStatus },
      eventType === 'PAYMENT_COMPLETED'
        ? '💳 Order marked PROCESSING from PAYMENT_COMPLETED'
        : '⚠️ Payment failure recorded on order',
    );
  } catch (err: any) {
    processedEvents.delete(idempotencyKey);
    throw err;
  }
}

export async function startPaymentEventConsumer(): Promise<void> {
  void (async () => {
    while (!isKafkaStopRequested()) {
      try {
        const consumer = await getKafkaConsumer();
        if (!consumer) {
          await sleep(5000);
          continue;
        }

        await consumer.subscribe({ topic: BKD_TOPICS.PAYMENTS, fromBeginning: false });
        logger.info({ topic: BKD_TOPICS.PAYMENTS }, '👂 Order Service listening for payment events');

        await consumer.run({
          eachMessage: async ({ message }) => {
            await handlePaymentEvent(message.value?.toString());
          },
        });
      } catch (err: any) {
        logger.warn({ err: err.message }, '⚠️ Order Kafka consumer stopped, retrying in 5s');
        markConsumerDisconnected();
        if (!isKafkaStopRequested()) {
          await sleep(5000);
        }
      }
    }
  })();
}
