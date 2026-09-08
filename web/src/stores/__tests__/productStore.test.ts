import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProductStore } from '../productStore.js';

describe('useProductStore', () => {
  beforeEach(() => {
    useProductStore.setState({
      products: [],
      featuredProducts: [],
      categories: [],
      currentProduct: null,
      error: null,
    });
    vi.restoreAllMocks();
  });

  it('initializes with default empty lists', () => {
    const state = useProductStore.getState();
    expect(state.products).toEqual([]);
    expect(state.featuredProducts).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.currentProduct).toBeNull();
  });

  it('fetches and normalizes products from API', async () => {
    const mockApiResponse = {
      products: [
        {
          _id: 'p1',
          name: 'Noise Cancelling Headphones',
          price: 9999,
          stock: 10,
          tags: ['bestseller'],
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as any);

    await useProductStore.getState().fetchProducts();

    const state = useProductStore.getState();
    expect(state.products).toHaveLength(1);
    expect(state.products[0].id).toBe('p1');
    expect(state.products[0].badge).toBe('BESTSELLER');
  });

  it('fetches products with specific search and category filters', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ products: [], total: 0 }),
    } as any);

    await useProductStore.getState().fetchProducts({
      category: 'headphones',
      search: 'anc',
      inStockOnly: true,
      pageSize: 10,
    });

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('category=headphones'));
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('q=anc'));
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('inStockOnly=true'));
  });

  it('fetches featured products', async () => {
    const mockFeatured = [
      { id: 'f1', name: 'Smart Watch', price: 4999 },
      { id: 'f2', name: 'Keyboard', price: 6999 },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ products: mockFeatured }),
    } as any);

    await useProductStore.getState().fetchFeaturedProducts(2);

    expect(useProductStore.getState().featuredProducts).toHaveLength(2);
  });

  it('fetches categories', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Audio', slug: 'audio' },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ categories: mockCategories }),
    } as any);

    await useProductStore.getState().fetchCategories();

    expect(useProductStore.getState().categories).toHaveLength(1);
    expect(useProductStore.getState().categories[0].name).toBe('Audio');
  });

  it('fetches product by ID and clears current product', async () => {
    const mockProduct = {
      id: 'p100',
      name: 'Mechanical Numpad',
      price: 1999,
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    } as any);

    const fetched = await useProductStore.getState().fetchProductById('p100');
    expect(fetched?.name).toBe('Mechanical Numpad');
    expect(useProductStore.getState().currentProduct?.id).toBe('p100');

    useProductStore.getState().clearCurrentProduct();
    expect(useProductStore.getState().currentProduct).toBeNull();
  });

  it('returns cached product from store if available without network request', async () => {
    useProductStore.setState({
      products: [{ id: 'cached-1', name: 'Cached Keyboard', price: 2999, slug: 'cached-keyboard' } as any],
    });

    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await useProductStore.getState().fetchProductById('cached-1');

    expect(result?.name).toBe('Cached Keyboard');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('handles error gracefully when fetchProductById fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as any);

    const result = await useProductStore.getState().fetchProductById('not-found');
    expect(result).toBeNull();
    expect(useProductStore.getState().currentProduct).toBeNull();
    expect(useProductStore.getState().error).toBeDefined();
  });

  it('handles error in fetchCategories gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    await useProductStore.getState().fetchCategories();
    expect(useProductStore.getState().categories).toEqual([]);
  });
});
