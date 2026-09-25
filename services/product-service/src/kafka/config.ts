import { Kafka, type Consumer, type Producer, logLevel } from 'kafkajs';
import { logger } from '../utils/logger.js';

export const BKD_TOPICS = {
  ORDERS: 'bkd.orders.events',
  PAYMENTS: 'bkd.payments.events',
  INVENTORY: 'bkd.inventory.events',
} as const;

export type InventoryEventType = 'STOCK_DECREMENTED' | 'STOCK_RESTORED';

const brokers = (process.env.KAFKA_BROKERS || process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092')
  .split(',')
  .map((b) => b.trim());

export const kafka = new Kafka({
  clientId: 'bkd-product-service',
  brokers,
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
});

let producer: Producer | null = null;
let producerConnected = false;
let consumer: Consumer | null = null;
let consumerConnected = false;
let stopRequested = false;

export async function getKafkaProducer(): Promise<Producer | null> {
  if (producer && producerConnected) return producer;

  try {
    producer = kafka.producer({ allowAutoTopicCreation: true });
    await producer.connect();
    producerConnected = true;
    logger.info({ brokers }, '🔌 Product Service connected to Apache Kafka Producer');
    return producer;
  } catch (err: any) {
    logger.warn({ err: err.message }, '⚠️ Kafka broker not reachable from product-service (resilient mode)');
    producer = null;
    producerConnected = false;
    return null;
  }
}

export async function getKafkaConsumer(): Promise<Consumer | null> {
  if (stopRequested) return null;
  if (consumer && consumerConnected) return consumer;

  try {
    consumer = kafka.consumer({
      groupId: 'bkd-product-inventory',
      allowAutoTopicCreation: true,
    });
    await consumer.connect();
    consumerConnected = true;
    logger.info({ brokers, groupId: 'bkd-product-inventory' }, '🔌 Product Service connected to Apache Kafka Consumer');
    return consumer;
  } catch (err: any) {
    logger.warn({ err: err.message }, '⚠️ Kafka consumer not reachable from product-service');
    consumer = null;
    consumerConnected = false;
    return null;
  }
}

export async function disconnectKafka(): Promise<void> {
  stopRequested = true;
  if (consumer && consumerConnected) {
    try {
      await consumer.disconnect();
    } catch (_) {}
    consumerConnected = false;
    consumer = null;
  }
  if (producer && producerConnected) {
    try {
      await producer.disconnect();
    } catch (_) {}
    producerConnected = false;
    producer = null;
  }
  logger.info('👋 Product Service disconnected from Kafka');
}

export function isKafkaStopRequested(): boolean {
  return stopRequested;
}

export function markConsumerDisconnected(): void {
  consumerConnected = false;
  consumer = null;
}
