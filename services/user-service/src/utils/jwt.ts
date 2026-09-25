import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

function readPayload(decoded: string | jwt.JwtPayload): TokenPayload {
  if (typeof decoded !== 'object' || decoded === null) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  const userId = typeof decoded.userId === 'string' ? decoded.userId : '';
  const email = typeof decoded.email === 'string' ? decoded.email : '';
  if (!userId) {
    throw new jwt.JsonWebTokenError('Token is missing userId');
  }
  return { userId, email };
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function generateTokenPair(payload: TokenPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

export function verifyAccessToken(token: string): TokenPayload {
  return readPayload(jwt.verify(token, config.jwt.accessSecret));
}

export function verifyRefreshToken(token: string): TokenPayload {
  return readPayload(jwt.verify(token, config.jwt.refreshSecret));
}
