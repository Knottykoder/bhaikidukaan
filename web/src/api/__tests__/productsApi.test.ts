import { describe, it, expect } from 'vitest';
import { normalizeProduct } from '../productsApi.js';

describe('normalizeProduct helper', () => {
  it('normalizes basic product fields with fallback values', () => {
    const raw = {
      _id: 'raw-123',
      name: 'Mechanical Numpad',
      price: 1499,
      compareAtPrice: 1999,
      stock: 5,
    };

    const normalized = normalizeProduct(raw);
    expect(normalized.id).toBe('raw-123');
    expect(normalized.name).toBe('Mechanical Numpad');
    expect(normalized.price).toBe(1499);
    expect(normalized.compareAtPrice).toBe(1999);
    expect(normalized.stock).toBe(5);
    expect(normalized.inStock).toBe(true);
    expect(normalized.currency).toBe('INR');
    expect(normalized.images).toBeDefined();
    expect(normalized.images.length).toBeGreaterThan(0);
  });

  it('detects BESTSELLER and TRENDING badges from tags', () => {
    const bestseller = normalizeProduct({ tags: ['bestseller'] });
    expect(bestseller.badge).toBe('BESTSELLER');

    const trending = normalizeProduct({ tags: ['trending'] });
    expect(trending.badge).toBe('TRENDING');

    const regular = normalizeProduct({ tags: ['audio'] });
    expect(regular.badge).toBeUndefined();
  });

  it('handles out-of-stock items correctly', () => {
    const outOfStock = normalizeProduct({ stock: 0 });
    expect(outOfStock.inStock).toBe(false);
  });

  it('handles attributes dictionary into features array', () => {
    const withAttrs = normalizeProduct({
      attributes: {
        Connectivity: 'Bluetooth 5.3',
        Weight: '250g',
      },
    });

    expect(withAttrs.features).toContain('Connectivity: Bluetooth 5.3');
    expect(withAttrs.features).toContain('Weight: 250g');
  });
});
