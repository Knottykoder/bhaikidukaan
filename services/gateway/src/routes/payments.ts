import { Router, type Request, type Response } from 'express';
import { paymentServiceClient, grpcCall } from '../grpc-clients.js';
import { logger } from '../logger.js';

const router = Router();

// ============================================
// POST /api/payments/create-order
// ============================================
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', orderId = '' } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }

    const response = await grpcCall<any, any>(paymentServiceClient, 'createRazorpayOrder', {
      orderId,
      amount: parseFloat(amount),
      currency,
    });

    logger.info({ razorpayOrderId: response.razorpayOrderId, amount }, '✅ Payment order created');

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Create payment order failed');
    res.status(500).json({ error: err.details || 'Failed to create payment order' });
  }
});

// ============================================
// POST /api/payments/verify
// ============================================
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayPaymentId) {
      res.status(400).json({ error: 'Payment ID is required for verification' });
      return;
    }

    const response = await grpcCall<any, any>(paymentServiceClient, 'verifyPayment', {
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || '',
      orderId: orderId || '',
    });

    logger.info({ verified: response.verified, paymentId: razorpayPaymentId }, '✅ Payment verified');

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Verify payment failed');
    res.status(500).json({ error: err.details || 'Failed to verify payment' });
  }
});

// ============================================
// GET /api/payments/:orderId
// ============================================
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const response = await grpcCall<any, any>(paymentServiceClient, 'getPaymentStatus', {
      orderId,
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Get payment status failed');
    res.status(500).json({ error: 'Failed to retrieve payment status' });
  }
});

export default router;
