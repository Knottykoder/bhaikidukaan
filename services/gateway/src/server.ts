import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { logger } from './logger.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';

const app = express();

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — allow frontend origins
app.use(
  cors({
    origin: config.corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.debug({ method: req.method, url: req.url }, '→ Incoming request');
  next();
});

// ============================================
// Health Check
// ============================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: config.serviceName,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// ============================================
// 404 handler
// ============================================

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// Start Server
// ============================================

app.listen(config.port, () => {
  logger.info(`🚀 API Gateway running on http://localhost:${config.port}`);
  logger.info('');
  logger.info('Available REST endpoints:');
  logger.info('  Auth:');
  logger.info('    POST /api/auth/register');
  logger.info('    POST /api/auth/login');
  logger.info('    POST /api/auth/refresh');
  logger.info('    GET  /api/auth/profile');
  logger.info('  Products:');
  logger.info('    GET  /api/products');
  logger.info('    GET  /api/products/featured');
  logger.info('    GET  /api/products/search?q=...');
  logger.info('    GET  /api/products/categories');
  logger.info('    GET  /api/products/:id');
  logger.info('  Orders:');
  logger.info('    POST /api/orders');
  logger.info('    GET  /api/orders');
  logger.info('    GET  /api/orders/:id');
  logger.info('    PATCH /api/orders/:id/cancel');
  logger.info('');
  logger.info(`📡 Proxying to User Service → ${config.userServiceAddress}`);
  logger.info(`📡 Proxying to Product Service → ${config.productServiceAddress}`);
  logger.info(`📡 Proxying to Order Service → ${config.orderServiceAddress}`);
});

export default app;
