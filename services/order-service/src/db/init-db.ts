import { pool } from './index.js';
import { logger } from '../utils/logger.js';

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    logger.info('⏳ Initializing Order Service Database Tables on Neon PostgreSQL...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(100) NOT NULL,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        subtotal NUMERIC(10, 2) NOT NULL,
        shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        total NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(30) NOT NULL DEFAULT 'razorpay',
        payment_id VARCHAR(100),
        razorpay_order_id VARCHAR(100),
        tracking_number VARCHAR(100),
        shipping_name VARCHAR(100) NOT NULL,
        shipping_line1 TEXT NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        shipping_state VARCHAR(100) NOT NULL,
        shipping_pincode VARCHAR(20) NOT NULL,
        shipping_phone VARCHAR(30) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image TEXT,
        price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        subtotal NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `);

    logger.info('✅ Order Service Database Tables & Indexes Initialized Successfully!');
  } catch (error) {
    logger.error({ error }, '❌ Database initialization failed');
    throw error;
  } finally {
    client.release();
  }
}
