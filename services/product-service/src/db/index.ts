import mongoose from 'mongoose';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export async function connectDB(): Promise<void> {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('📦 MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, '❌ MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('🔌 MongoDB disconnected');
    });

    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`✅ Connected to MongoDB at: ${config.mongo.uri.split('@').pop()}`);
  } catch (error) {
    logger.error({ error }, '❌ Failed to connect to MongoDB');
    // Allow non-fatal boot in dev if running offline
    if (config.env === 'production') {
      throw error;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('🔌 MongoDB connection closed');
}
