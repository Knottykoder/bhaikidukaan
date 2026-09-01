import { Router, type Request, type Response } from 'express';
import { productServiceClient, grpcCall } from '../grpc-clients.js';
import { logger } from '../logger.js';

const router = Router();

// ============================================
// GET /api/products?page=1&pageSize=20&category=...&sort=...
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '20',
      category,
      sort,
      minPrice,
      maxPrice,
      tags,
      inStockOnly,
    } = req.query;

    const response = await grpcCall<any, any>(productServiceClient, 'listProducts', {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      categoryId: (category as string) || '',
      sortBy: (sort as string) || 'featured',
      minPrice: minPrice ? parseFloat(minPrice as string) : 0,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : 0,
      tags: tags ? (tags as string).split(',') : [],
      inStockOnly: inStockOnly === 'true',
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ ListProducts failed');
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============================================
// GET /api/products/featured?limit=8
// ============================================
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '8', 10);
    const response = await grpcCall<any, any>(productServiceClient, 'getFeaturedProducts', { limit });
    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ GetFeaturedProducts failed');
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// ============================================
// GET /api/products/search?q=headphones&page=1
// ============================================
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q = '', page = '1', pageSize = '20', category, minPrice, maxPrice } = req.query;

    const response = await grpcCall<any, any>(productServiceClient, 'searchProducts', {
      query: q as string,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      categoryId: (category as string) || '',
      minPrice: minPrice ? parseFloat(minPrice as string) : 0,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : 0,
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ SearchProducts failed');
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================
// GET /api/products/categories
// ============================================
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const response = await grpcCall<any, any>(productServiceClient, 'listCategories', {});
    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ ListCategories failed');
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ============================================
// GET /api/products/:id
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await grpcCall<any, any>(productServiceClient, 'getProduct', {
      id,
      slug: '',
    });
    res.json(response);
  } catch (err: any) {
    logger.error({ err: err.message }, '❌ GetProduct failed');
    if (err.code === 5) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
