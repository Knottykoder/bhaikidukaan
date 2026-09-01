import { Router, type Request, type Response } from 'express';
import { userServiceClient, grpcCall } from '../grpc-clients.js';
import { logger } from '../logger.js';

const router = Router();

// ============================================
// POST /api/auth/register
// ============================================
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const response = await grpcCall<any, any>(userServiceClient, 'register', {
      name,
      email,
      password,
      phone: phone || '',
    });

    logger.info({ email }, '✅ User registered via Gateway');

    res.status(201).json({
      user: response.user,
      tokens: response.tokens,
    });
  } catch (err: any) {
    logger.error({ err: err.message, code: err.code }, '❌ Register failed');

    if (err.code === 6) {
      // ALREADY_EXISTS
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }
    if (err.code === 3) {
      // INVALID_ARGUMENT
      res.status(400).json({ error: err.details || err.message });
      return;
    }

    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const response = await grpcCall<any, any>(userServiceClient, 'login', {
      email,
      password,
    });

    logger.info({ email }, '✅ User logged in via Gateway');

    res.json({
      user: response.user,
      tokens: response.tokens,
    });
  } catch (err: any) {
    logger.error({ err: err.message, code: err.code }, '❌ Login failed');

    if (err.code === 5 || err.code === 16) {
      // NOT_FOUND or UNAUTHENTICATED
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (err.code === 3) {
      res.status(400).json({ error: err.details || err.message });
      return;
    }

    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ============================================
// POST /api/auth/refresh
// ============================================
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const response = await grpcCall<any, any>(userServiceClient, 'refreshToken', {
      refreshToken,
    });

    res.json({ tokens: response.tokens });
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Token refresh failed');
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// ============================================
// GET /api/auth/profile  (requires Authorization header)
// ============================================
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const metadata = new (await import('@grpc/grpc-js')).Metadata();
    metadata.add('authorization', authHeader);

    const response = await new Promise<any>((resolve, reject) => {
      userServiceClient.getProfile({}, metadata, (err: any, resp: any) => {
        if (err) reject(err);
        else resolve(resp);
      });
    });

    res.json({ user: response.user });
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Get profile failed');
    res.status(401).json({ error: 'Unauthorized or profile not found' });
  }
});

// ============================================
// PUT /api/auth/profile
// ============================================
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const { name, phone, avatarUrl } = req.body;
    const metadata = new (await import('@grpc/grpc-js')).Metadata();
    metadata.add('authorization', authHeader);

    const response = await new Promise<any>((resolve, reject) => {
      userServiceClient.updateProfile(
        { name, phone, avatarUrl },
        metadata,
        (err: any, resp: any) => {
          if (err) reject(err);
          else resolve(resp);
        },
      );
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Update profile failed');
    res.status(400).json({ error: err.details || 'Failed to update profile' });
  }
});

// ============================================
// POST /api/auth/addresses
// ============================================
router.post('/addresses', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const { label, line1, line2, city, state, pincode, country, isDefault } = req.body;

    const metadata = new (await import('@grpc/grpc-js')).Metadata();
    metadata.add('authorization', authHeader);

    const response = await new Promise<any>((resolve, reject) => {
      userServiceClient.addAddress(
        {
          address: {
            label: label || 'Home',
            line1,
            line2: line2 || '',
            city,
            state,
            pincode,
            country: country || 'India',
            isDefault: Boolean(isDefault),
          },
        },
        metadata,
        (err: any, resp: any) => {
          if (err) reject(err);
          else resolve(resp);
        },
      );
    });

    res.status(201).json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Add address failed');
    res.status(400).json({ error: err.details || 'Failed to add address' });
  }
});

// ============================================
// DELETE /api/auth/addresses/:id
// ============================================
router.delete('/addresses/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const { id } = req.params;
    const metadata = new (await import('@grpc/grpc-js')).Metadata();
    metadata.add('authorization', authHeader);

    const response = await new Promise<any>((resolve, reject) => {
      userServiceClient.deleteAddress(
        { addressId: id },
        metadata,
        (err: any, resp: any) => {
          if (err) reject(err);
          else resolve(resp);
        },
      );
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ Delete address failed');
    res.status(400).json({ error: err.details || 'Failed to delete address' });
  }
});

export default router;
