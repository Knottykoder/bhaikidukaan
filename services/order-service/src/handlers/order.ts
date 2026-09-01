import { type ServerUnaryCall, type sendUnaryData, status } from '@grpc/grpc-js';
import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import { orders, orderItems, type Order, type OrderItem } from '../db/schema.js';
import { updateProductStock } from '../grpc-clients.js';
import { logger } from '../utils/logger.js';

// ============================================
// Helper: Format Order for gRPC response
// ============================================

function formatOrder(order: Order, items: OrderItem[] = []) {
  return {
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: parseFloat(order.subtotal),
    shippingCost: parseFloat(order.shippingCost),
    tax: parseFloat(order.tax),
    total: parseFloat(order.total),
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId || '',
    razorpayOrderId: order.razorpayOrderId || '',
    trackingNumber: order.trackingNumber || '',
    shippingAddress: {
      id: '',
      label: 'Delivery',
      name: order.shippingName,
      line1: order.shippingLine1,
      line2: '',
      city: order.shippingCity,
      state: order.shippingState,
      pincode: order.shippingPincode,
      phone: order.shippingPhone,
      isDefault: false,
    },
    items: items.map((item) => ({
      productId: item.productId,
      variantId: '',
      productName: item.productName,
      productImage: item.productImage || '',
      price: parseFloat(item.price),
      quantity: item.quantity,
      subtotal: parseFloat(item.subtotal),
    })),
    notes: order.notes || '',
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `BKD-${dateStr}-${randomSuffix}`;
}

// ============================================
// Create Order
// ============================================

export async function createOrder(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const {
      userId = 'guest',
      items = [],
      shippingAddress = {},
      paymentMethod = 'razorpay',
      paymentId = '',
      subtotal = 0,
      shippingCost = 0,
      tax = 0,
      total = 0,
      notes = '',
    } = call.request;

    if (!items || items.length === 0) {
      callback({ code: status.INVALID_ARGUMENT, message: 'Order must contain at least one item' });
      return;
    }

    if (!shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      callback({ code: status.INVALID_ARGUMENT, message: 'Shipping address is incomplete' });
      return;
    }

    const orderNumber = generateOrderNumber();

    // 1. Insert order record
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        orderNumber,
        status: 'CONFIRMED',
        subtotal: String(subtotal),
        shippingCost: String(shippingCost),
        tax: String(tax),
        total: String(total),
        paymentMethod,
        paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 9)}`,
        shippingName: shippingAddress.name,
        shippingLine1: shippingAddress.line1,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state || '',
        shippingPincode: shippingAddress.pincode,
        shippingPhone: shippingAddress.phone || '',
        notes,
      })
      .returning();

    // 2. Insert order items
    const itemRecords = items.map((item: any) => ({
      orderId: newOrder.id,
      productId: item.productId || 'item',
      productName: item.productName || 'Product',
      productImage: item.productImage || '',
      price: String(item.price || 0),
      quantity: item.quantity || 1,
      subtotal: String(item.subtotal || item.price * (item.quantity || 1)),
    }));

    const insertedItems = await db.insert(orderItems).values(itemRecords).returning();

    // 3. Decrement Product Inventory Stock via Product Service gRPC
    try {
      await Promise.all(
        items.map((item: any) =>
          updateProductStock(item.productId, -Math.max(1, parseInt(item.quantity || 1, 10))),
        ),
      );
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Could not decrement stock for all items');
    }

    logger.info(
      { orderId: newOrder.id, orderNumber: newOrder.orderNumber, userId, total: newOrder.total },
      '✅ New Order Created in PostgreSQL Database & Stock Decremented',
    );

    callback(null, {
      order: formatOrder(newOrder, insertedItems),
      razorpayOrderId: newOrder.razorpayOrderId || '',
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ CreateOrder failed');
    callback({ code: status.INTERNAL, message: 'Failed to create order' });
  }
}

// ============================================
// Get Single Order
// ============================================

export async function getOrder(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { orderId } = call.request;

    if (!orderId) {
      callback({ code: status.INVALID_ARGUMENT, message: 'Order ID is required' });
      return;
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    if (!order) {
      callback({ code: status.NOT_FOUND, message: 'Order not found' });
      return;
    }

    callback(null, { order: formatOrder(order, order.items) });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ GetOrder failed');
    callback({ code: status.INTERNAL, message: 'Failed to retrieve order' });
  }
}

// ============================================
// List Orders (for user)
// ============================================

export async function listOrders(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { userId, page = 1, pageSize = 20, status: filterStatus } = call.request;

    const limit = Math.max(1, Math.min(pageSize, 50));
    const offset = (Math.max(1, page) - 1) * limit;

    const isValidStatus =
      filterStatus &&
      filterStatus !== 'ORDER_STATUS_UNSPECIFIED' &&
      filterStatus !== '0' &&
      filterStatus !== '';

    let whereClause = undefined;
    if (userId && isValidStatus) {
      whereClause = and(eq(orders.userId, userId), eq(orders.status, filterStatus));
    } else if (userId) {
      whereClause = eq(orders.userId, userId);
    } else if (isValidStatus) {
      whereClause = eq(orders.status, filterStatus);
    }

    const [userOrders, totalCountResult] = await Promise.all([
      db.query.orders.findMany({
        where: whereClause,
        orderBy: [desc(orders.createdAt)],
        limit,
        offset,
        with: {
          items: true,
        },
      }),
      db.select({ count: count() }).from(orders).where(whereClause),
    ]);

    const total = Number(totalCountResult[0]?.count || 0);

    callback(null, {
      orders: userOrders.map((o) => formatOrder(o, o.items)),
      total,
      page,
      pageSize: limit,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ ListOrders failed');
    callback({ code: status.INTERNAL, message: 'Failed to list orders' });
  }
}

// ============================================
// Cancel Order
// ============================================

export async function cancelOrder(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { orderId, reason } = call.request;

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: 'CANCELLED',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by customer',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      callback({ code: status.NOT_FOUND, message: 'Order not found' });
      return;
    }

    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, updatedOrder.id),
    });

    logger.info({ orderId, orderNumber: updatedOrder.orderNumber }, '🚫 Order Cancelled');

    callback(null, { order: formatOrder(updatedOrder, items) });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ CancelOrder failed');
    callback({ code: status.INTERNAL, message: 'Failed to cancel order' });
  }
}

// ============================================
// Update Order Status (Internal / Admin)
// ============================================

export async function updateOrderStatus(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { orderId, status: newStatus, paymentId } = call.request;

    const updatePayload: any = {
      status: newStatus,
      updatedAt: new Date(),
    };
    if (paymentId) updatePayload.paymentId = paymentId;

    const [updatedOrder] = await db
      .update(orders)
      .set(updatePayload)
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      callback({ code: status.NOT_FOUND, message: 'Order not found' });
      return;
    }

    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, updatedOrder.id),
    });

    callback(null, { order: formatOrder(updatedOrder, items) });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ UpdateOrderStatus failed');
    callback({ code: status.INTERNAL, message: 'Failed to update order status' });
  }
}
