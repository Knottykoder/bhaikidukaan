import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home } from '../Home.js';

vi.mock('../../api/productsApi.js', () => ({
  useGetFeaturedProductsQuery: vi.fn(() => ({
    data: [
      {
        id: 'p1',
        name: 'Curated Wireless Headphones',
        slug: 'curated-headphones',
        description: 'Studio audio',
        price: 9999,
        compareAtPrice: 14999,
        currency: 'INR',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
        categoryId: 'audio',
        categoryName: 'Wireless Audio',
        tags: ['bestseller'],
        stock: 10,
        inStock: true,
        rating: 4.9,
        reviewCount: 42,
        badge: 'BESTSELLER',
      },
    ],
    isLoading: false,
  })),
  useGetCategoriesQuery: vi.fn(() => ({
    data: [
      { id: 'audio', name: 'Wireless Audio', productCount: 32, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
      { id: 'wearables', name: 'Smart Watches', productCount: 24, imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12' },
    ],
    isLoading: false,
  })),
}));

describe('Home Page (Redesigned Storefront)', () => {
  it('renders 2-column Hero section with headline and action links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('Upgrade Your')).toBeInTheDocument();
    expect(screen.getByText('Everyday Tech')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Shop Now/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Collection/i })).toBeInTheDocument();
  });

  it('renders customer trust rating stack', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('4.9 / 5.0')).toBeInTheDocument();
    expect(screen.getByText(/Over 50,000\+ Happy Customers Across India/i)).toBeInTheDocument();
  });

  it('renders Shop by Category and Featured Products sections', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('Shop by Category')).toBeInTheDocument();
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
    expect(screen.getByText('Curated Wireless Headphones')).toBeInTheDocument();
  });

  it('renders 5 trust assurances bar and promise section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/Free Express Shipping|Free Express Delivery/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/THE BHAIKIDUKAAN PROMISE/i)).toBeInTheDocument();
  });

  it('renders curated category fallback cards when categories API returns empty', async () => {
    const { useGetCategoriesQuery } = await import('../../api/productsApi.js');
    vi.mocked(useGetCategoriesQuery).mockReturnValueOnce({
      data: [],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('Mechanical Keyboards')).toBeInTheDocument();
  });
});
