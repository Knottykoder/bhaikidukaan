import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { orderServiceClient, grpcCall } from '../grpc-clients.js';
import { logger } from '../logger.js';

const router = Router();

// Helper: Extract userId from JWT token
function getUserIdFromReq(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.userId) return decoded.userId;
    } catch {
      // ignore
    }
  }
  return (req.body && req.body.userId) || 'usr-guest';
}

// ============================================
// POST /api/orders — Place Order
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const {
      items,
      shippingAddress,
      paymentMethod = 'razorpay',
      paymentId,
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must contain items' });
      return;
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1) {
      res.status(400).json({ error: 'Complete shipping address is required' });
      return;
    }

    const response = await grpcCall<any, any>(orderServiceClient, 'createOrder', {
      userId,
      items: items.map((i: any) => ({
        productId: i.productId || i.product?.id || 'item',
        productName: i.productName || i.product?.name || 'Product',
        productImage: i.productImage || i.product?.images?.[0] || '',
        price: parseFloat(i.price || i.product?.price || 0),
        quantity: parseInt(i.quantity || 1, 10),
        subtotal: parseFloat(i.subtotal || (i.price || i.product?.price || 0) * (i.quantity || 1)),
      })),
      shippingAddress: {
        id: '',
        label: 'Delivery',
        name: shippingAddress.name,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || '',
        phone: shippingAddress.phone || '',
        isDefault: false,
      },
      paymentMethod,
      paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 9)}`,
      subtotal: parseFloat(subtotal || 0),
      shippingCost: parseFloat(shippingCost || 0),
      tax: parseFloat(tax || 0),
      total: parseFloat(total || 0),
      notes: notes || '',
    });

    logger.info({ orderId: response.order?.id, userId }, '✅ Order created via Gateway');

    res.status(201).json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Create order failed');
    res.status(500).json({ error: err.details || 'Failed to create order' });
  }
});

// ============================================
// GET /api/orders — List User Orders
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    const { page = '1', pageSize = '20', status } = req.query;

    const response = await grpcCall<any, any>(orderServiceClient, 'listOrders', {
      userId: userId === 'usr-guest' ? '' : userId,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      status: (status as string) || '',
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ List orders failed');
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// ============================================
// GET /api/orders/:id — Get Single Order
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await grpcCall<any, any>(orderServiceClient, 'getOrder', {
      orderId: id,
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Get order failed');
    if (err.code === 5) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// ============================================
// PATCH /api/orders/:id/cancel — Cancel Order
// ============================================
router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const response = await grpcCall<any, any>(orderServiceClient, 'cancelOrder', {
      orderId: id,
      reason,
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Cancel order failed');
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
