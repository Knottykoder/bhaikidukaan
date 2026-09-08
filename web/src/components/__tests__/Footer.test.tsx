import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer.js';

describe('Footer Component', () => {
  it('renders brand highlights and trust pillars', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText('Free Express Delivery')).toBeInTheDocument();
    expect(screen.getByText('100% Genuine Products')).toBeInTheDocument();
    expect(screen.getByText('7-Day Easy Returns')).toBeInTheDocument();
  });

  it('renders store links and copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/BHAIKIDUKAAN/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
