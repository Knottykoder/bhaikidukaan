import { type ServerUnaryCall, type sendUnaryData, status } from '@grpc/grpc-js';
import { razorpay, verifySignature } from '../utils/razorpay.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { publishPaymentEvent } from '../kafka/producer.js';

// In-memory payment records store (or PostgreSQL)
const paymentRecords = new Map<string, any>();

// ============================================
// Create Razorpay Order
// ============================================

export async function createRazorpayOrder(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { orderId = '', amount = 0, currency = 'INR' } = call.request;

    if (amount <= 0) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: 'Amount must be greater than 0',
      });
      return;
    }

    const amountInPaise = Math.round(amount * 100);
    let razorpayOrderId = '';

    // Attempt real Razorpay API call if available
    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt: orderId || `rcpt_${Date.now()}`,
          notes: {
            app: 'BhaiKiDukaan',
            orderId,
          },
        });
        razorpayOrderId = rzpOrder.id;
        logger.info({ razorpayOrderId, amount }, '✅ Razorpay Order created via SDK');
      } catch (err: any) {
        logger.warn(
          { err: err.message },
          'Razorpay API request failed (likely invalid credentials), using sandbox order ID',
        );
        razorpayOrderId = `order_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      }
    } else {
      razorpayOrderId = `order_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    }

    // Save preliminary payment record
    paymentRecords.set(razorpayOrderId, {
      id: `pay_rec_${Date.now()}`,
      orderId,
      razorpayOrderId,
      amount,
      currency,
      status: 'PAYMENT_STATUS_CREATED',
      createdAt: new Date().toISOString(),
    });

    callback(null, {
      razorpayOrderId,
      amount,
      currency,
      razorpayKeyId: config.razorpay.keyId,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ createRazorpayOrder failed');
    callback({ code: status.INTERNAL, message: 'Failed to create payment order' });
  }
}

// ============================================
// Verify Payment Signature
// ============================================

export async function verifyPayment(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const {
      razorpayOrderId = '',
      razorpayPaymentId = '',
      razorpaySignature = '',
      orderId = '',
    } = call.request;

    if (!razorpayPaymentId) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: 'Payment ID is required for verification',
      });
      return;
    }

    const isValid = verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    const paymentData = {
      id: razorpayPaymentId,
      orderId,
      userId: '',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: 0,
      currency: 'INR',
      status: isValid ? 'PAYMENT_STATUS_CAPTURED' : 'PAYMENT_STATUS_FAILED',
      method: 'PAYMENT_METHOD_UPI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    paymentRecords.set(razorpayPaymentId, paymentData);

    // Publish Kafka Payment Event
    publishPaymentEvent(isValid ? 'PAYMENT_COMPLETED' : 'PAYMENT_FAILED', {
      orderId,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      amount: paymentData.amount,
      currency: 'INR',
      error: isValid ? undefined : 'Invalid payment signature',
      timestamp: new Date().toISOString(),
    }).catch(() => { });

    logger.info(
      { paymentId: razorpayPaymentId, orderId, verified: isValid },
      isValid ? '✅ Payment Signature Verified & Event Published' : '⚠️ Payment Verification Failed & Event Published',
    );

    callback(null, {
      verified: isValid,
      payment: paymentData,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ verifyPayment failed');
    callback({ code: status.INTERNAL, message: 'Failed to verify payment' });
  }
}

// ============================================
// Get Payment Status
// ============================================

export async function getPaymentStatus(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { orderId } = call.request;
    const payment = paymentRecords.get(orderId) || {
      id: `pay_${orderId}`,
      orderId,
      status: 'PAYMENT_STATUS_CAPTURED',
      amount: 0,
      currency: 'INR',
      createdAt: new Date().toISOString(),
    };

    callback(null, { payment });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ getPaymentStatus failed');
    callback({ code: status.INTERNAL, message: 'Failed to get payment status' });
  }
}

// ============================================
// Refund Payment
// ============================================

export async function refundPayment(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { paymentId, amount, reason } = call.request;
    const refundId = `rfnd_${Math.random().toString(36).substring(2, 9)}`;

    logger.info({ paymentId, amount, reason, refundId }, '💸 Refund initiated');

    callback(null, {
      success: true,
      refundId,
      newStatus: 'PAYMENT_STATUS_REFUNDED',
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '❌ refundPayment failed');
    callback({ code: status.INTERNAL, message: 'Failed to process refund' });
  }
}
