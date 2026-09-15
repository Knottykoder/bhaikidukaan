import type { TokenPayload } from '../auth/jwt.js';

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export {};
