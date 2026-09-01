import { type ServerUnaryCall, type sendUnaryData, status } from '@grpc/grpc-js';
import mongoose from 'mongoose';
import { ProductModel, type IProduct } from '../db/models/product.model.js';
import { CategoryModel } from '../db/models/category.model.js';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES, type ProductItem } from '../db/fallback-data.js';
import { logger } from '../utils/logger.js';

function isMongoReady(): boolean {
  return mongoose.connection.readyState === 1;
}

// ============================================
// Helper: Format Product for gRPC response
// ============================================

function formatProduct(p: IProduct) {
  const attributesObj: Record<string, string> = {};
  if (p.attributes instanceof Map) {
    p.attributes.forEach((val, key) => {
      attributesObj[key] = String(val);
    });
  } else if (p.attributes && typeof p.attributes === 'object') {
    Object.assign(attributesObj, p.attributes);
  }

  return {
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: Number(p.price || 0),
    compareAtPrice: Number(p.compareAtPrice || 0),
    currency: p.currency || 'INR',
    images: p.images || [],
    categoryId: p.categoryId || '',
    categoryName: p.categoryName || '',
    tags: p.tags || [],
    stock: Number(p.stock || 0),
    inStock: (p.stock || 0) > 0,
    rating: Number(p.rating || 5.0),
    reviewCount: Number(p.reviewCount || 0),
    variants: (p.variants || []).map((v) => {
      const optionsObj: Record<string, string> = {};
      if (v.options instanceof Map) {
        v.options.forEach((val, key) => {
          optionsObj[key] = String(val);
        });
      } else if (v.options) {
        Object.assign(optionsObj, v.options);
      }

      return {
        id: v.id || (v as any)._id?.toString() || '',
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        stock: Number(v.stock || 0),
        options: optionsObj,
      };
    }),
    attributes: attributesObj,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

// ============================================
// List Products (with pagination & filters)
// ============================================

export async function listProducts(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const {
      page = 1,
      pageSize = 20,
      categoryId,
      sortBy = 'featured',
      minPrice,
      maxPrice,
      tags,
      inStockOnly,
    } = call.request;

    const limit = Math.max(1, Math.min(pageSize, 100));
    const skip = (Math.max(1, page) - 1) * limit;

    if (isMongoReady()) {
      const filter: any = {};
      if (categoryId && categoryId !== 'all') filter.categoryId = categoryId;
      if (minPrice !== undefined && minPrice > 0) filter.price = { ...filter.price, $gte: minPrice };
      if (maxPrice !== undefined && maxPrice > 0) filter.price = { ...filter.price, $lte: maxPrice };
      if (inStockOnly) filter.stock = { $gt: 0 };
      if (tags && tags.length > 0) filter.tags = { $in: tags };

      let sort: any = { createdAt: -1 };
      if (sortBy === 'price_asc') sort = { price: 1 };
      else if (sortBy === 'price_desc') sort = { price: -1 };
      else if (sortBy === 'rating') sort = { rating: -1 };
      else if (sortBy === 'newest') sort = { createdAt: -1 };

      const [products, total] = await Promise.all([
        ProductModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        ProductModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      callback(null, {
        products: products.map(formatProduct),
        total,
        page,
        pageSize: limit,
        totalPages,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...FALLBACK_PRODUCTS];
    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === categoryId || p.categoryName.toLowerCase().includes(categoryId.toLowerCase()));
    }
    if (minPrice !== undefined && minPrice > 0) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    callback(null, {
      products: paginated,
      total,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (error) {
    logger.error({ error }, '❌ listProducts failed');
    callback({ code: status.INTERNAL, message: 'Failed to retrieve products' });
  }
}

// ============================================
// Get Single Product (by id or slug)
// ============================================

export async function getProduct(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { id, slug } = call.request;

    if (isMongoReady()) {
      let product: IProduct | null = null;
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        product = await ProductModel.findById(id).exec();
      }
      if (!product && slug) {
        product = await ProductModel.findOne({ slug }).exec();
      }
      if (!product && id) {
        product = await ProductModel.findOne({ slug: id }).exec();
      }

      if (product) {
        callback(null, { product: formatProduct(product) });
        return;
      }
    }

    // Fallback
    const found = FALLBACK_PRODUCTS.find(
      (p) => p.id === id || p.slug === slug || p.slug === id,
    );

    if (found) {
      callback(null, { product: found });
      return;
    }

    callback({ code: status.NOT_FOUND, message: `Product not found` });
  } catch (error) {
    logger.error({ error }, '❌ getProduct failed');
    callback({ code: status.INTERNAL, message: 'Failed to retrieve product' });
  }
}

// ============================================
// Get Featured Products
// ============================================

export async function getFeaturedProducts(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const limit = Math.max(1, Math.min(call.request.limit || 8, 20));

    if (isMongoReady()) {
      const products = await ProductModel.find({ stock: { $gt: 0 } })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(limit)
        .exec();

      callback(null, { products: products.map(formatProduct) });
      return;
    }

    // Fallback
    const sorted = [...FALLBACK_PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, limit);
    callback(null, { products: sorted });
  } catch (error) {
    logger.error({ error }, '❌ getFeaturedProducts failed');
    callback({ code: status.INTERNAL, message: 'Failed to retrieve featured products' });
  }
}

// ============================================
// Search Products
// ============================================

export async function searchProducts(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { query = '', page = 1, pageSize = 20, categoryId, minPrice, maxPrice } = call.request;

    const limit = Math.max(1, Math.min(pageSize, 100));
    const skip = (Math.max(1, page) - 1) * limit;

    if (isMongoReady()) {
      const filter: any = {};
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ];
      }
      if (categoryId && categoryId !== 'all') filter.categoryId = categoryId;
      if (minPrice !== undefined && minPrice > 0) filter.price = { ...filter.price, $gte: minPrice };
      if (maxPrice !== undefined && maxPrice > 0) filter.price = { ...filter.price, $lte: maxPrice };

      const [products, total] = await Promise.all([
        ProductModel.find(filter).skip(skip).limit(limit).exec(),
        ProductModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      callback(null, {
        products: products.map(formatProduct),
        total,
        page,
        pageSize: limit,
        totalPages,
      });
      return;
    }

    // Fallback
    const q = query.toLowerCase();
    let matches = FALLBACK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );

    if (categoryId && categoryId !== 'all') {
      matches = matches.filter((p) => p.categoryId === categoryId);
    }
    if (minPrice !== undefined && minPrice > 0) {
      matches = matches.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      matches = matches.filter((p) => p.price <= maxPrice);
    }

    const total = matches.length;
    const paginated = matches.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    callback(null, {
      products: paginated,
      total,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (error) {
    logger.error({ error }, '❌ searchProducts failed');
    callback({ code: status.INTERNAL, message: 'Failed to search products' });
  }
}

// ============================================
// List Categories
// ============================================

export async function listCategories(
  _call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    if (isMongoReady()) {
      const categories = await CategoryModel.find({}).exec();
      callback(null, {
        categories: categories.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          imageUrl: c.imageUrl || '',
          productCount: c.productCount || 0,
        })),
      });
      return;
    }

    // Fallback
    callback(null, { categories: FALLBACK_CATEGORIES });
  } catch (error) {
    logger.error({ error }, '❌ listCategories failed');
    callback({ code: status.INTERNAL, message: 'Failed to retrieve categories' });
  }
}

// ============================================
// Create Product
// ============================================

export async function createProduct(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const data = call.request;
    if (isMongoReady()) {
      const product = await ProductModel.create({
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      callback(null, { product: formatProduct(product) });
      return;
    }

    const newProd: ProductItem = {
      id: 'prod-' + (FALLBACK_PRODUCTS.length + 1),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      price: data.price || 0,
      compareAtPrice: data.compareAtPrice || 0,
      currency: 'INR',
      images: data.images || [],
      categoryId: data.categoryId || '',
      categoryName: data.categoryName || '',
      tags: data.tags || [],
      stock: data.stock || 10,
      inStock: (data.stock || 10) > 0,
      rating: 5.0,
      reviewCount: 0,
      variants: [],
      attributes: data.attributes || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    FALLBACK_PRODUCTS.push(newProd);
    callback(null, { product: newProd });
  } catch (error) {
    logger.error({ error }, '❌ createProduct failed');
    callback({ code: status.INTERNAL, message: 'Failed to create product' });
  }
}

// ============================================
// Update Stock
// ============================================

export async function updateStock(
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
): Promise<void> {
  try {
    const { productId, quantityDelta } = call.request;
    if (isMongoReady()) {
      const isObjId = mongoose.Types.ObjectId.isValid(productId);
      const query = isObjId ? { _id: productId } : { $or: [{ slug: productId }, { name: productId }] };
      const product = await ProductModel.findOneAndUpdate(
        query,
        { $inc: { stock: quantityDelta } },
        { new: true },
      ).exec();
      if (product) {
        logger.info({ productId, newStock: product.stock, quantityDelta }, '📉 Stock updated in MongoDB');
        callback(null, {
          success: true,
          newStock: product.stock,
          productId,
        });
        return;
      }
    }

    const prod = FALLBACK_PRODUCTS.find((p) => p.id === productId || p.slug === productId || p.name === productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock + quantityDelta);
      logger.info({ productId, newStock: prod.stock, quantityDelta }, '📉 Stock updated in catalog');
      callback(null, {
        success: true,
        newStock: prod.stock,
        productId,
      });
      return;
    }

    callback({ code: status.NOT_FOUND, message: 'Product not found' });
  } catch (error) {
    logger.error({ error }, '❌ updateStock failed');
    callback({ code: status.INTERNAL, message: 'Failed to update stock' });
  }
}
