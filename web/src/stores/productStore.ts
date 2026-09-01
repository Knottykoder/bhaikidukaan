import { create } from 'zustand';
import { type Product, type Category, type ProductFilters } from '../types/product.js';
import { API_BASE } from '../api/config.js';

export type { Product, Category, ProductFilters };

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  currentProduct: Product | null;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  clearCurrentProduct: () => void;
}

function normalizeProduct(p: any): Product {
  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (p.imageUrl ? [p.imageUrl] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80']);

  const stockNum = Number(p.stock ?? p.inventory ?? 0);

  return {
    id: p.id || p._id || '',
    name: p.name || 'Untitled Product',
    slug: p.slug || '',
    description: p.description || '',
    price: Number(p.price || 0),
    compareAtPrice: Number(p.compareAtPrice || p.price || 0),
    currency: p.currency || 'INR',
    images,
    categoryId: p.categoryId || (typeof p.category === 'object' ? p.category?.id : p.category) || '',
    categoryName: p.categoryName || (typeof p.category === 'object' ? p.category?.name : p.category) || 'General',
    tags: Array.isArray(p.tags) ? p.tags : [],
    stock: stockNum,
    inStock: typeof p.inStock === 'boolean' ? p.inStock : (stockNum > 0),
    rating: Number(p.rating || 4.8),
    reviewCount: Number(p.reviewCount || 0),
    badge: p.tags?.includes('bestseller') ? 'BESTSELLER' : p.tags?.includes('trending') ? 'TRENDING' : undefined,
    features: p.attributes
      ? Object.entries(p.attributes).map(([k, v]) => `${k}: ${v}`)
      : (Array.isArray(p.features) ? p.features : []),
  };
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  totalProducts: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  isDetailLoading: false,
  error: null,

  clearCurrentProduct: () => set({ currentProduct: null, error: null }),

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.sortBy) params.set('sort', filters.sortBy);
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
      if (filters.inStockOnly) params.set('inStockOnly', 'true');

      let endpoint = `${API_BASE}/products?${params.toString()}`;
      if (filters.search && filters.search.trim() !== '') {
        params.set('q', filters.search.trim());
        endpoint = `${API_BASE}/products/search?${params.toString()}`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to load products: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      const rawList = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
      const normalizedList = rawList.map(normalizeProduct);

      set({
        products: normalizedList,
        totalProducts: data.total ?? normalizedList.length,
        totalPages: data.totalPages ?? (Math.ceil((data.total ?? normalizedList.length) / (filters.pageSize || 20)) || 1),
        currentPage: data.page ?? 1,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Failed to fetch products from backend API:', err.message);
      set({
        products: [],
        totalProducts: 0,
        isLoading: false,
        error: err.message || 'Unable to connect to product catalog',
      });
    }
  },

  fetchFeaturedProducts: async (limit = 4) => {
    try {
      const res = await fetch(`${API_BASE}/products/featured?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load featured products');
      const data = await res.json();

      const rawList = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
      const normalized = rawList.map(normalizeProduct);
      set({ featuredProducts: normalized });
    } catch (err: any) {
      console.warn('Failed to fetch featured products:', err.message);
      set({ featuredProducts: [] });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/products/categories`);
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();

      const rawCats = Array.isArray(data.categories) ? data.categories : (Array.isArray(data) ? data : []);
      const formatted: Category[] = rawCats.map((c: any) => ({
        id: c.id || c._id || c.slug || '',
        name: c.name || 'Category',
        slug: c.slug || '',
        description: c.description || '',
        imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        productCount: c.productCount || 0,
        icon: c.icon || 'ShoppingBag',
      }));
      set({ categories: formatted });
    } catch (err: any) {
      console.warn('Failed to fetch categories:', err.message);
      set({ categories: [] });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isDetailLoading: true, error: null });

    // Check existing store first
    const existing = get().products.find((p) => p.id === id || p.slug === id);
    if (existing) {
      set({ currentProduct: existing, isDetailLoading: false });
      return existing;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) {
        throw new Error(`Product not found (${res.status})`);
      }
      const data = await res.json();

      if (data.product || data.id || data._id) {
        const prod = normalizeProduct(data.product || data);
        set({ currentProduct: prod, isDetailLoading: false, error: null });
        return prod;
      }
      throw new Error('Product not found in response');
    } catch (err: any) {
      console.warn(`Product API get ${id} error:`, err.message);
      set({ currentProduct: null, isDetailLoading: false, error: err.message || 'Product not found' });
      return null;
    }
  },
}));
