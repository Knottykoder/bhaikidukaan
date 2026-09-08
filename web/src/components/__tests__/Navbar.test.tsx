import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../Navbar.js';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuthStore } from '../../stores/authStore.js';

describe('Navbar Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useAuthStore.getState().logout();
  });

  it('renders announcement bar and brand logo', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText(/FREE EXPRESS DELIVERY ACROSS INDIA/i)).toBeInTheDocument();
    expect(screen.getByText(/KiDukaan/i)).toBeInTheDocument();
    expect(screen.getByText(/PREMIUM LIFESTYLE & TECH/i)).toBeInTheDocument();
  });

  it('renders search bar and handles query submission', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(/Search audio gear/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'headphones' } });
    expect(searchInput).toHaveValue('headphones');
  });

  it('toggles cart drawer when clicking cart button', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const cartBtn = screen.getByRole('button', { name: /View Cart/i });
    fireEvent.click(cartBtn);

    expect(useCartStore.getState().isCartOpen).toBe(true);
  });

  it('renders sign in button when user is unauthenticated', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders user button and dropdown menu when authenticated', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: 'u-nav', email: 'nav@bhaikidukaan.com', name: 'Vikram Singh' },
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const userBtn = screen.getByRole('button', { name: /Vikram/i });
    expect(userBtn).toBeInTheDocument();

    fireEvent.click(userBtn);
    expect(screen.getByText('nav@bhaikidukaan.com')).toBeInTheDocument();
    expect(screen.getByText('My Profile & Addresses')).toBeInTheDocument();

    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('submits search query form', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(/Search audio gear/i);
    fireEvent.change(searchInput, { target: { value: 'smartwatch' } });
    fireEvent.submit(searchInput.closest('form')!);
  });
});
