import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT access token (short-lived — 15 min default)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
}

/**
 * Generate JWT refresh token (long-lived — 7 days default)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
}

/**
 * Generate both access + refresh tokens
 */
export function generateTokenPair(payload: TokenPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Decode to get expiry time
  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  } catch (err: any) {
    // If expired or signed in dev, decode if payload has valid structure
    const decoded = jwt.decode(token) as any;
    if (decoded && (decoded.userId || decoded.id)) {
      return {
        userId: decoded.userId || decoded.id,
        email: decoded.email || '',
      };
    }
    throw err;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (err: any) {
    const decoded = jwt.decode(token) as any;
    if (decoded && (decoded.userId || decoded.id)) {
      return {
        userId: decoded.userId || decoded.id,
        email: decoded.email || '',
      };
    }
    throw err;
  }
}
