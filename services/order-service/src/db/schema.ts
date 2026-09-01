import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// Orders Table
// ============================================

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: varchar('user_id', { length: 100 }).notNull(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    status: varchar('status', { length: 30 }).notNull().default('CONFIRMED'),
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    shippingCost: numeric('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
    tax: numeric('tax', { precision: 10, scale: 2 }).notNull().default('0.00'),
    total: numeric('total', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 30 }).notNull().default('razorpay'),
    paymentId: varchar('payment_id', { length: 100 }),
    razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    shippingName: varchar('shipping_name', { length: 100 }).notNull(),
    shippingLine1: text('shipping_line1').notNull(),
    shippingCity: varchar('shipping_city', { length: 100 }).notNull(),
    shippingState: varchar('shipping_state', { length: 100 }).notNull(),
    shippingPincode: varchar('shipping_pincode', { length: 20 }).notNull(),
    shippingPhone: varchar('shipping_phone', { length: 30 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_orders_user_id').on(table.userId),
    index('idx_orders_order_number').on(table.orderNumber),
    index('idx_orders_status').on(table.status),
    index('idx_orders_created_at').on(table.createdAt),
  ],
);

// ============================================
// Order Items Table
// ============================================

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 100 }).notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productImage: text('product_image'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull().default(1),
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_order_items_order_id').on(table.orderId),
    index('idx_order_items_product_id').on(table.productId),
  ],
);

// ============================================
// Relations
// ============================================

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
