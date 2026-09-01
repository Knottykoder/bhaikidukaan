import { type ServerUnaryCall, type sendUnaryData, status, type Metadata } from '@grpc/grpc-js';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { addresses } from '../db/schema.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

// ============================================
// Validation
// ============================================

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(5, 'Pincode must be at least 5 characters'),
  country: z.string().optional().default('India'),
  isDefault: z.boolean().optional().default(false),
});

// ============================================
// Helper: Extract userId from metadata
// ============================================

function getUserId(metadata: Metadata): string | null {
  const authHeaders = (metadata.get('authorization') || []).concat(metadata.get('Authorization') || []);
  if (!authHeaders || authHeaders.length === 0) return null;
  const raw = String(authHeaders[0]).trim();
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    return verifyAccessToken(token).userId;
  } catch {
    return null;
  }
}

// ============================================
// Add Address
// ============================================

export async function addAddress(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const userId = getUserId(call.metadata);
    if (!userId) {
      callback({ code: status.UNAUTHENTICATED, message: 'Authentication required' });
      return;
    }

    const parsed = addressSchema.safeParse(call.request.address);
    if (!parsed.success) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const data = parsed.data;

    // If this is set as default, unset all other defaults
    if (data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }

    const [newAddress] = await db
      .insert(addresses)
      .values({
        userId,
        label: data.label,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country || 'India',
        isDefault: data.isDefault ?? false,
      })
      .returning();

    logger.info({ userId, addressId: newAddress.id }, '✅ Address added');

    callback(null, {
      address: {
        id: newAddress.id,
        label: newAddress.label,
        line1: newAddress.line1,
        line2: newAddress.line2 || '',
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ AddAddress failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}

// ============================================
// Update Address
// ============================================

export async function updateAddress(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const userId = getUserId(call.metadata);
    if (!userId) {
      callback({ code: status.UNAUTHENTICATED, message: 'Authentication required' });
      return;
    }

    const addressData = call.request.address;
    if (!addressData?.id) {
      callback({ code: status.INVALID_ARGUMENT, message: 'Address ID is required' });
      return;
    }

    // If setting as default, unset all others
    if (addressData.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }

    // Build update
    const updateData: Record<string, any> = {};
    if (addressData.label) updateData.label = addressData.label;
    if (addressData.line1) updateData.line1 = addressData.line1;
    if (addressData.line2 !== undefined) updateData.line2 = addressData.line2 || null;
    if (addressData.city) updateData.city = addressData.city;
    if (addressData.state) updateData.state = addressData.state;
    if (addressData.pincode) updateData.pincode = addressData.pincode;
    if (addressData.country) updateData.country = addressData.country;
    if (addressData.isDefault !== undefined) updateData.isDefault = addressData.isDefault;

    const [updated] = await db
      .update(addresses)
      .set(updateData)
      .where(and(eq(addresses.id, addressData.id), eq(addresses.userId, userId)))
      .returning();

    if (!updated) {
      callback({ code: status.NOT_FOUND, message: 'Address not found' });
      return;
    }

    logger.info({ addressId: updated.id }, '✅ Address updated');

    callback(null, {
      address: {
        id: updated.id,
        label: updated.label,
        line1: updated.line1,
        line2: updated.line2 || '',
        city: updated.city,
        state: updated.state,
        pincode: updated.pincode,
        country: updated.country,
        isDefault: updated.isDefault,
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ UpdateAddress failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}

// ============================================
// Delete Address
// ============================================

export async function deleteAddress(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const userId = getUserId(call.metadata);
    if (!userId) {
      callback({ code: status.UNAUTHENTICATED, message: 'Authentication required' });
      return;
    }

    const { addressId } = call.request;
    if (!addressId) {
      callback({ code: status.INVALID_ARGUMENT, message: 'Address ID is required' });
      return;
    }

    const deleted = await db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      callback({ code: status.NOT_FOUND, message: 'Address not found' });
      return;
    }

    logger.info({ addressId }, '✅ Address deleted');
    callback(null, { success: true });
  } catch (error) {
    logger.error({ error }, '❌ DeleteAddress failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}
