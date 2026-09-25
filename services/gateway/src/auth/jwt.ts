import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new jwt.JsonWebTokenError('Invalid access token');
  }

  const userId = typeof decoded.userId === 'string' ? decoded.userId : '';
  const email = typeof decoded.email === 'string' ? decoded.email : '';
  if (!userId) {
    throw new jwt.JsonWebTokenError('Access token is missing userId');
  }

  return { userId, email };
}
