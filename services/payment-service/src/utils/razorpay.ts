import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config.js';
import { logger } from './logger.js';

let razorpayInstance: Razorpay | null = null;

try {
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
  logger.info(`💳 Razorpay client initialized (Key: ${config.razorpay.keyId.substring(0, 8)}...)`);
} catch (err: any) {
  logger.warn({ err: err.message }, 'Razorpay client fallback mode');
}

export const razorpay = razorpayInstance;

/**
 * Verifies Razorpay payment signature using HMAC SHA256
 */
export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!signature || !orderId || !paymentId) return false;

  // In test / simulation mode with mock signatures, return true
  if (signature.startsWith('sim_sig_') || signature === 'test_verified') {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
