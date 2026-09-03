import { Kafka, type Producer, logLevel } from 'kafkajs';
import { logger } from '../utils/logger.js';

export const BKD_TOPICS = {
  PAYMENTS: 'bkd.payments.events',
  ORDERS: 'bkd.orders.events',
} as const;

export type PaymentEventType = 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED';

const brokers = (process.env.KAFKA_BROKERS || process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092')
  .split(',')
  .map((b) => b.trim());

export const kafka = new Kafka({
  clientId: 'bkd-payment-service',
  brokers,
  logLevel: logLevel.NOTHING,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

let producer: Producer | null = null;
let isConnected = false;

export async function getKafkaProducer(): Promise<Producer | null> {
  if (producer && isConnected) return producer;

  try {
    producer = kafka.producer({ allowAutoTopicCreation: true });
    await producer.connect();
    isConnected = true;
    logger.info({ brokers }, '🔌 Payment Service connected to Apache Kafka Producer');
    return producer;
  } catch (err: any) {
    logger.warn({ err: err.message }, '⚠️ Kafka broker not reachable from payment-service (resilient mode)');
    producer = null;
    isConnected = false;
    return null;
  }
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (producer && isConnected) {
    try {
      await producer.disconnect();
      isConnected = false;
      logger.info('👋 Disconnected Kafka Payment Producer');
    } catch (_) {}
  }
}
