import { describe, it, expect } from 'vitest';
import { GATEWAY_URL, API_BASE } from '../config.js';

describe('API Config', () => {
  it('resolves GATEWAY_URL and API_BASE with sensible defaults', () => {
    expect(GATEWAY_URL).toBeDefined();
    expect(API_BASE).toBe(`${GATEWAY_URL}/api`);
    expect(API_BASE).toMatch(/\/api$/);
  });
});
