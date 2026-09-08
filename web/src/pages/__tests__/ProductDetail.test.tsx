import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProductDetail } from '../ProductDetail.js';
import { useCartStore } from '../../stores/cartStore.js';

const mockDetailProduct = {
  id: 'p-detail-1',
  name: 'Apple AirPods Max Sky Blue',
  slug: 'apple-airpods-max-blue',
  description: 'Acoustic masterpiece with spatial audio and active noise cancellation.',
  price: 49999,
  compareAtPrice: 59900,
  currency: 'INR',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
  ],
  categoryId: 'headphones',
  categoryName: 'Headphones',
  tags: ['bestseller'],
  stock: 10,
  inStock: true,
  rating: 4.9,
  reviewCount: 258,
  badge: 'BESTSELLER',
};

vi.mock('../../api/productsApi.js', () => ({
  useGetProductByIdQuery: vi.fn(() => ({
    data: mockDetailProduct,
    isLoading: false,
    error: null,
  })),
  useGetFeaturedProductsQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

describe('ProductDetail Page (Redesigned)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('renders breadcrumbs, product title, formatted price, and weekend discount tag', () => {
    render(
      <MemoryRouter initialEntries={['/product/p-detail-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Apple AirPods Max Sky Blue', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('₹49,999')).toBeInTheDocument();
    expect(screen.getByText('Discount Only For This Weekend')).toBeInTheDocument();
  });

  it('interacts with color swatches', () => {
    render(
      <MemoryRouter initialEntries={['/product/p-detail-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    const pinkSwatch = screen.getByTitle('Rose Pink');
    fireEvent.click(pinkSwatch);

    expect(screen.getByText('Rose Pink')).toBeInTheDocument();
  });

  it('handles quantity stepper increment and decrement', () => {
    render(
      <MemoryRouter initialEntries={['/product/p-detail-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    const plusBtn = screen.getByRole('button', { name: '+' });
    fireEvent.click(plusBtn);
    expect(screen.getByText('2')).toBeInTheDocument();

    const minusBtn = screen.getByRole('button', { name: '-' });
    fireEvent.click(minusBtn);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('switches between Description, Additional Information (Specs), and Reviews tabs', () => {
    render(
      <MemoryRouter initialEntries={['/product/p-detail-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    // Default tab is specs
    expect(screen.getByRole('columnheader', { name: 'Specification' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Details' })).toBeInTheDocument();

    // Click Description
    const descTab = screen.getByRole('button', { name: /^Description/i });
    fireEvent.click(descTab);
    expect(screen.getByText('Lossless Fidelity')).toBeInTheDocument();

    // Click Reviews
    const reviewsTab = screen.getByRole('button', { name: /Reviews/i });
    fireEvent.click(reviewsTab);
    expect(screen.getByText(/Based on 258 verified customer reviews/i)).toBeInTheDocument();
  });

  it('handles Add to Cart and updates cartStore', () => {
    render(
      <MemoryRouter initialEntries={['/product/p-detail-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addBtn);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('p-detail-1');
  });

  it('handles Buy Now and opens checkout flow', () => {
    render(
      <MemoryRouter initialEntries={['/product/p-detail-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    const buyNowBtn = screen.getByRole('button', { name: /Buy Now/i });
    fireEvent.click(buyNowBtn);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
  });

  it('renders loading state when query is loading', async () => {
    const { useGetProductByIdQuery } = await import('../../api/productsApi.js');
    vi.mocked(useGetProductByIdQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(
      <MemoryRouter initialEntries={['/product/p-loading']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading Product Details...')).toBeInTheDocument();
  });

  it('renders not found state when product does not exist', async () => {
    const { useGetProductByIdQuery } = await import('../../api/productsApi.js');
    vi.mocked(useGetProductByIdQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: { data: { error: 'Catalog item not found' } },
    } as any);

    render(
      <MemoryRouter initialEntries={['/product/p-not-found']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Product Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Catalog/i })).toBeInTheDocument();
  });
});
