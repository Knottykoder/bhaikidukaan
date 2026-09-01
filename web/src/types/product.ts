// ============================================
// Core Product & Category Domain Types
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  currency: string;
  images: string[];
  categoryId: string;
  categoryName: string;
  tags: string[];
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  features: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
  icon: string;
}

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
