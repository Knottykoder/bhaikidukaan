import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartDrawer } from '../CartDrawer.js';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { Product } from '../../types/product.js';

const mockProduct: Product = {
  id: 'cart-p1',
  name: 'Mechanical Gaming Keyboard',
  slug: 'mechanical-keyboard',
  description: 'Custom mechanical switches',
  price: 5999,
  compareAtPrice: 7999,
  currency: 'INR',
  images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3'],
  categoryId: 'keyboards',
  categoryName: 'Keyboards',
  tags: [],
  stock: 15,
  inStock: true,
  rating: 4.8,
  reviewCount: 90,
  features: [],
};

describe('CartDrawer Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().setCartOpen(true);
  });

  it('renders empty cart state when no items are present', () => {
    render(
      <MemoryRouter>
        <CartDrawer />
      </MemoryRouter>,
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  it('renders items, calculates totals, and handles quantity changes', () => {
    useCartStore.getState().addItem(mockProduct, 1);

    render(
      <MemoryRouter>
        <CartDrawer />
      </MemoryRouter>,
    );

    expect(screen.getByText('Mechanical Gaming Keyboard')).toBeInTheDocument();
    expect(screen.getAllByText(/₹5,999/).length).toBeGreaterThanOrEqual(1);

    // Increment item
    const plusBtn = screen.getByTitle('Increase');
    fireEvent.click(plusBtn);
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    // Decrement item
    const minusBtn = screen.getByTitle('Decrease');
    fireEvent.click(minusBtn);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('removes item from cart drawer', () => {
    useCartStore.getState().addItem(mockProduct, 1);

    render(
      <MemoryRouter>
        <CartDrawer />
      </MemoryRouter>,
    );

    const deleteBtn = screen.getByTitle('Remove');
    fireEvent.click(deleteBtn);

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('navigates and closes cart on Start Shopping click', () => {
    render(
      <MemoryRouter>
        <CartDrawer />
      </MemoryRouter>,
    );

    const startBtn = screen.getByRole('button', { name: /Start Shopping/i });
    fireEvent.click(startBtn);

    expect(useCartStore.getState().isCartOpen).toBe(false);
  });

  it('proceeds to checkout and closes cart drawer', () => {
    useAuthStore.setState({ isAuthenticated: true });
    useCartStore.getState().addItem(mockProduct, 1);

    render(
      <MemoryRouter>
        <CartDrawer />
      </MemoryRouter>,
    );

    const checkoutBtn = screen.getByRole('button', { name: /Proceed to Checkout/i });
    fireEvent.click(checkoutBtn);

    expect(useCartStore.getState().isCartOpen).toBe(false);
  });
});
