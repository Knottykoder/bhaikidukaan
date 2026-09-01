import { type ServerUnaryCall, type sendUnaryData, status, type Metadata } from '@grpc/grpc-js';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

// ============================================
// Helper: Extract userId from gRPC metadata
// ============================================

function getUserIdFromMetadata(metadata: Metadata): string | null {
  const authHeaders = (metadata.get('authorization') || []).concat(metadata.get('Authorization') || []);
  if (!authHeaders || authHeaders.length === 0) return null;

  const raw = String(authHeaders[0]).trim();
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    return payload.userId;
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to verify token from metadata in getUserIdFromMetadata');
    return null;
  }
}

// ============================================
// Get Profile
// ============================================

export async function getProfile(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const userId = getUserIdFromMetadata(call.metadata);
    if (!userId) {
      callback({
        code: status.UNAUTHENTICATED,
        message: 'Authentication required',
      });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { addresses: true },
    });

    if (!user) {
      callback({ code: status.NOT_FOUND, message: 'User not found' });
      return;
    }

    callback(null, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        addresses: user.addresses.map((addr) => ({
          id: addr.id,
          label: addr.label,
          line1: addr.line1,
          line2: addr.line2 || '',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
          isDefault: addr.isDefault,
        })),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ GetProfile failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}

// ============================================
// Update Profile
// ============================================

export async function updateProfile(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const userId = getUserIdFromMetadata(call.metadata);
    if (!userId) {
      callback({
        code: status.UNAUTHENTICATED,
        message: 'Authentication required',
      });
      return;
    }

    const { name, phone, avatarUrl } = call.request;

    // Build update object — only include non-empty fields
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    if (Object.keys(updateData).length === 0) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: 'At least one field must be provided to update',
      });
      return;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      callback({ code: status.NOT_FOUND, message: 'User not found' });
      return;
    }

    logger.info({ userId }, '✅ Profile updated');

    callback(null, {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone || '',
        avatarUrl: updatedUser.avatarUrl || '',
        addresses: [],
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ UpdateProfile failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}
