import { apiSlice } from './apiSlice.js';
import { type Product, type Category, type ProductFilters } from '../types/product.js';

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function normalizeProduct(p: any): Product {
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

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters?.page) params.set('page', String(filters.page));
        if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
        if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
        if (filters?.sortBy) params.set('sort', filters.sortBy);
        if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
        if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
        if (filters?.inStockOnly) params.set('inStockOnly', 'true');

        if (filters?.search && filters.search.trim() !== '') {
          params.set('q', filters.search.trim());
          return `/products/search?${params.toString()}`;
        }
        return `/products?${params.toString()}`;
      },
      transformResponse: (response: any, _meta, arg) => {
        const rawList = Array.isArray(response.products) ? response.products : (Array.isArray(response) ? response : []);
        const normalizedList = rawList.map(normalizeProduct);
        const pageSize = (arg && 'pageSize' in arg ? arg.pageSize : 20) || 20;
        const total = response.total ?? normalizedList.length;
        return {
          products: normalizedList,
          total,
          page: response.page ?? (arg && 'page' in arg ? arg.page : 1) ?? 1,
          pageSize,
          totalPages: response.totalPages ?? Math.ceil(total / pageSize) ?? 1,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getFeaturedProducts: builder.query<Product[], number | void>({
      query: (limit = 4) => `/products/featured?limit=${limit || 4}`,
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response.products) ? response.products : (Array.isArray(response) ? response : []);
        return rawList.map(normalizeProduct);
      },
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => '/products/categories',
      transformResponse: (response: any) => {
        const rawCats = Array.isArray(response.categories) ? response.categories : (Array.isArray(response) ? response : []);
        return rawCats.map((c: any) => ({
          id: c.id || c._id || c.slug || '',
          name: c.name || 'Category',
          slug: c.slug || '',
          description: c.description || '',
          imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          productCount: c.productCount || 0,
          icon: c.icon || 'ShoppingBag',
        }));
      },
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: any) => {
        const raw = response.product || response;
        return normalizeProduct(raw);
      },
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useLazyGetProductsQuery,
} = productsApi;
