import { describe, it, expect } from 'vitest';
import { store } from '../index.js';
import { setCartDrawerOpen } from '../slices/uiSlice.js';

describe('Redux Root Store', () => {
  it('configures Redux store with uiReducer and apiSlice', () => {
    expect(store.getState().ui).toBeDefined();
    expect(store.getState().api).toBeDefined();
  });

  it('dispatches ui actions through root store', () => {
    store.dispatch(setCartDrawerOpen(true));
    expect(store.getState().ui.isCartDrawerOpen).toBe(true);

    store.dispatch(setCartDrawerOpen(false));
    expect(store.getState().ui.isCartDrawerOpen).toBe(false);
  });
});
