import { type ServerUnaryCall, type sendUnaryData, status } from '@grpc/grpc-js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

// ============================================
// Validation Schemas
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// Helper: Format user for gRPC response
// ============================================

function formatUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    addresses: [],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// ============================================
// Register
// ============================================

export async function register(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(call.request);
    if (!parsed.success) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { email, password, name, phone } = parsed.data;

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      callback({
        code: status.ALREADY_EXISTS,
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
      })
      .returning();

    // Generate tokens
    const tokens = generateTokenPair({ userId: newUser.id, email: newUser.email });

    logger.info({ userId: newUser.id, email }, '✅ User registered');

    callback(null, {
      user: formatUser(newUser),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ Register failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}

// ============================================
// Login
// ============================================

export async function login(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    // Validate input
    const parsed = loginSchema.safeParse(call.request);
    if (!parsed.success) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      callback({
        code: status.NOT_FOUND,
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      callback({
        code: status.UNAUTHENTICATED,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    logger.info({ userId: user.id, email }, '✅ User logged in');

    callback(null, {
      user: formatUser(user),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ Login failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}

// ============================================
// Refresh Token
// ============================================

export async function refreshToken(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { refreshToken: token } = call.request;

    if (!token) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      callback({
        code: status.UNAUTHENTICATED,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Check user still exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      callback({
        code: status.NOT_FOUND,
        message: 'User no longer exists',
      });
      return;
    }

    // Generate new token pair
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    logger.debug({ userId: user.id }, '🔄 Token refreshed');

    callback(null, {
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ Token refresh failed');
    callback({ code: status.INTERNAL, message: 'Internal server error' });
  }
}
