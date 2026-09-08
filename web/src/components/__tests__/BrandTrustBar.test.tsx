import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrandTrustBar } from '../BrandTrustBar.js';

describe('BrandTrustBar Component', () => {
  it('renders the assurance tagline', () => {
    render(<BrandTrustBar />);
    expect(
      screen.getByText(/AUTHORISED RETAIL PARTNERS & DIRECT WARRANTY ASSURANCE/i),
    ).toBeInTheDocument();
  });

  it('renders all authorized partner brands and handles hover states', () => {
    render(<BrandTrustBar />);
    const expectedBrands = ['APPLE', 'SAMSUNG', 'SONY', 'boAt', 'KEYCHRON', 'LOGITECH', 'JBL', 'NOISE'];

    expectedBrands.forEach((brand) => {
      expect(screen.getByText(brand)).toBeInTheDocument();
    });

    const appleEl = screen.getByText('APPLE');
    fireEvent.mouseEnter(appleEl);
    expect(appleEl.style.color).toBe('rgb(248, 250, 252)');

    fireEvent.mouseLeave(appleEl);
    expect(appleEl.style.color).toBe('rgb(148, 163, 184)');
  });
});
