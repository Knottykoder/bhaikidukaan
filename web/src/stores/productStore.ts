import { create } from 'zustand';
import { type MockProduct, type MockCategory, MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockData.js';
import { API_BASE } from '../api/config.js';

export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

interface ProductState {
  products: MockProduct[];
  featuredProducts: MockProduct[];
  categories: MockCategory[];
  currentProduct: MockProduct | null;
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
  fetchProductById: (id: string) => Promise<MockProduct | null>;
}

function normalizeProduct(p: any): MockProduct {
  return {
    id: p.id || p._id || '',
    name: p.name || 'Untitled Product',
    slug: p.slug || '',
    description: p.description || '',
    price: Number(p.price || 0),
    compareAtPrice: Number(p.compareAtPrice || 0),
    currency: p.currency || 'INR',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    categoryId: p.categoryId || '',
    categoryName: p.categoryName || 'General',
    tags: Array.isArray(p.tags) ? p.tags : [],
    stock: Number(p.stock || 0),
    inStock: typeof p.inStock === 'boolean' ? p.inStock : (Number(p.stock || 0) > 0),
    rating: Number(p.rating || 4.8),
    reviewCount: Number(p.reviewCount || 0),
    badge: p.tags?.includes('bestseller') ? 'BESTSELLER' : p.tags?.includes('trending') ? 'TRENDING' : undefined,
    features: p.attributes ? Object.entries(p.attributes).map(([k, v]) => `${k}: ${v}`) : [],
  };
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: MOCK_PRODUCTS,
  featuredProducts: MOCK_PRODUCTS.slice(0, 4),
  categories: MOCK_CATEGORIES,
  currentProduct: null,
  totalProducts: MOCK_PRODUCTS.length,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  isDetailLoading: false,
  error: null,

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
      if (filters.search) {
        params.set('q', filters.search);
        endpoint = `${API_BASE}/products/search?${params.toString()}`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to load products: ${res.statusText}`);
      const data = await res.json();

      const normalizedList = (data.products || []).map(normalizeProduct);

      set({
        products: normalizedList.length > 0 ? normalizedList : MOCK_PRODUCTS,
        totalProducts: data.total || normalizedList.length,
        totalPages: data.totalPages || 1,
        currentPage: data.page || 1,
        isLoading: false,
      });
    } catch (err: any) {
      console.warn('Backend product API unreachable, fallback to local catalogue:', err.message);
      set({
        products: MOCK_PRODUCTS,
        isLoading: false,
        error: err.message,
      });
    }
  },

  fetchFeaturedProducts: async (limit = 4) => {
    try {
      const res = await fetch(`${API_BASE}/products/featured?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load featured products');
      const data = await res.json();

      const normalized = (data.products || []).map(normalizeProduct);
      if (normalized.length > 0) {
        set({ featuredProducts: normalized });
      }
    } catch (err) {
      // Fallback already in state
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/products/categories`);
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();

      if (Array.isArray(data.categories) && data.categories.length > 0) {
        const formatted = data.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          imageUrl: c.imageUrl || '',
          productCount: c.productCount || 0,
          icon: 'ShoppingBag',
        }));
        set({ categories: formatted });
      }
    } catch (err) {
      // Fallback
    }
  },

  fetchProductById: async (id: string) => {
    set({ isDetailLoading: true, error: null });

    // Check existing store first
    const existing = get().products.find((p) => p.id === id || p.slug === id);
    if (existing) {
      set({ currentProduct: existing });
    }

    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();

      if (data.product) {
        const prod = normalizeProduct(data.product);
        set({ currentProduct: prod, isDetailLoading: false });
        return prod;
      }
    } catch (err: any) {
      console.warn(`Product API get ${id} error:`, err.message);
      // Fallback to local mock list
      const fallback = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id) || MOCK_PRODUCTS[0];
      set({ currentProduct: fallback, isDetailLoading: false });
      return fallback;
    }

    set({ isDetailLoading: false });
    return existing || null;
  },
}));
