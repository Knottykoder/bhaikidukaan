import { BKD_TOPICS, getKafkaConsumer, isKafkaStopRequested, markConsumerDisconnected } from './config.js';
import { publishInventoryEvent } from './producer.js';
import { applyStockDelta } from '../inventory.js';
import { logger } from '../utils/logger.js';

const processedEvents = new Set<string>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOrderEvent(raw: string | undefined): {
  eventType: string;
  payload: {
    orderId?: string;
    orderNumber?: string;
    items?: Array<{ productId: string; quantity: number }>;
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

async function handleOrderEvent(raw: string | undefined): Promise<void> {
  const event = parseOrderEvent(raw);
  if (!event) return;

  const { eventType, payload } = event;
  const orderId = payload.orderId || '';
  const items = payload.items || [];
  if (!orderId || items.length === 0) return;

  if (eventType !== 'ORDER_CREATED' && eventType !== 'ORDER_CANCELLED') return;

  const idempotencyKey = `${eventType}:${orderId}`;
  if (processedEvents.has(idempotencyKey)) {
    logger.debug({ idempotencyKey }, 'Skipping already processed order inventory event');
    return;
  }
  processedEvents.add(idempotencyKey);

  const sign = eventType === 'ORDER_CREATED' ? -1 : 1;
  const inventoryType = eventType === 'ORDER_CREATED' ? 'STOCK_DECREMENTED' : 'STOCK_RESTORED';

  try {
    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity || 1));
      const result = await applyStockDelta(item.productId, sign * qty);
      if (!result) continue;

      await publishInventoryEvent(inventoryType, {
        orderId,
        orderNumber: payload.orderNumber,
        productId: item.productId,
        quantityDelta: sign * qty,
        newStock: result.newStock,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(
      { orderId, eventType, itemCount: items.length },
      eventType === 'ORDER_CREATED'
        ? '📦 Inventory decremented from ORDER_CREATED'
        : '📦 Inventory restocked from ORDER_CANCELLED',
    );
  } catch (err: any) {
    processedEvents.delete(idempotencyKey);
    throw err;
  }
}

export async function startOrderEventConsumer(): Promise<void> {
  void (async () => {
    while (!isKafkaStopRequested()) {
      try {
        const consumer = await getKafkaConsumer();
        if (!consumer) {
          await sleep(5000);
          continue;
        }

        await consumer.subscribe({ topic: BKD_TOPICS.ORDERS, fromBeginning: false });
        logger.info({ topic: BKD_TOPICS.ORDERS }, '👂 Product Service listening for order events');

        await consumer.run({
          eachMessage: async ({ message }) => {
            await handleOrderEvent(message.value?.toString());
          },
        });
      } catch (err: any) {
        logger.warn({ err: err.message }, '⚠️ Product Kafka consumer stopped, retrying in 5s');
        markConsumerDisconnected();
        if (!isKafkaStopRequested()) {
          await sleep(5000);
        }
      }
    }
  })();
}
