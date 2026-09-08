import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../ProductCard.js';
import { useCartStore } from '../../stores/cartStore.js';
import { Product } from '../../types/product.js';

const mockProduct: Product = {
  id: 'prod-test-1',
  name: 'Apple AirPods Max Wireless',
  slug: 'apple-airpods-max',
  description: 'Computational audio with high-fidelity sound',
  price: 49999,
  compareAtPrice: 59900,
  currency: 'INR',
  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
  categoryId: 'cat-audio',
  categoryName: 'Headphones',
  tags: ['bestseller'],
  stock: 8,
  inStock: true,
  rating: 4.9,
  reviewCount: 258,
  badge: 'BESTSELLER',
  features: ['Active Noise Cancellation'],
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('renders product name, category, and formatted Indian Rupee price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Apple AirPods Max Wireless')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.getByText('₹49,999')).toBeInTheDocument();
    expect(screen.getByText('₹59,900')).toBeInTheDocument();
  });

  it('calculates and displays the discount and bestseller badges', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    // 49999 / 59900 = ~17% off
    expect(screen.getByText(/-17%/i)).toBeInTheDocument();
    expect(screen.getByText('BESTSELLER')).toBeInTheDocument();
  });

  it('toggles wishlist heart state on click', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    const wishlistBtn = screen.getByTitle(/Save to wishlist/i);
    expect(wishlistBtn).toBeInTheDocument();

    fireEvent.click(wishlistBtn);
    expect(screen.getByTitle(/Remove from wishlist/i)).toBeInTheDocument();

    fireEvent.click(wishlistBtn);
    expect(screen.getByTitle(/Save to wishlist/i)).toBeInTheDocument();
  });

  it('dispatches product to cartStore when clicking Add to Cart', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addBtn);

    const cartItems = useCartStore.getState().items;
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].product.id).toBe('prod-test-1');
    expect(cartItems[0].quantity).toBe(1);

    // Button should briefly show Added! state
    expect(screen.getByText(/Added!/i)).toBeInTheDocument();
  });

  it('renders correctly in compact mode', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} compact={true} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Apple AirPods Max Wireless')).toBeInTheDocument();
    expect(screen.getByText('₹49,999')).toBeInTheDocument();

    const quickAddBtn = screen.getByTitle(/Quick Add to Cart/i);
    expect(quickAddBtn).toBeInTheDocument();

    fireEvent.click(quickAddBtn);
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('triggers hover transitions on card elements', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    const titleEl = screen.getByText('Apple AirPods Max Wireless');
    fireEvent.mouseEnter(titleEl);
    fireEvent.mouseLeave(titleEl);

    const addBtn = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.mouseEnter(addBtn);
    fireEvent.mouseLeave(addBtn);
  });
});
