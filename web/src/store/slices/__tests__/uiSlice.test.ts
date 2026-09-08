import { describe, it, expect } from 'vitest';
import uiReducer, {
  setCartDrawerOpen,
  toggleCartDrawer,
  setAiChatOpen,
  toggleAiChat,
  openAuthModal,
  closeAuthModal,
  setCategoryFilter,
  setSearchQuery,
  setSortBy,
  setMaxPrice,
  setInStockOnly,
  resetFilters,
} from '../uiSlice.js';

describe('uiSlice Redux Reducer', () => {
  const initial = {
    isCartDrawerOpen: false,
    isAiChatOpen: false,
    isAuthModalOpen: false,
    authModalTab: 'login' as const,
    productFilters: {
      category: 'all',
      search: '',
      sortBy: 'featured' as const,
      maxPrice: 10000,
      inStockOnly: false,
    },
  };

  it('handles cart and AI chat drawer toggling', () => {
    let state = uiReducer(initial, setCartDrawerOpen(true));
    expect(state.isCartDrawerOpen).toBe(true);

    state = uiReducer(state, toggleCartDrawer());
    expect(state.isCartDrawerOpen).toBe(false);

    state = uiReducer(state, setAiChatOpen(true));
    expect(state.isAiChatOpen).toBe(true);

    state = uiReducer(state, toggleAiChat());
    expect(state.isAiChatOpen).toBe(false);
  });

  it('handles auth modal opening and closing', () => {
    let state = uiReducer(initial, openAuthModal('register'));
    expect(state.isAuthModalOpen).toBe(true);
    expect(state.authModalTab).toBe('register');

    const defaultState = uiReducer(initial, openAuthModal(undefined));
    expect(defaultState.isAuthModalOpen).toBe(true);
    expect(defaultState.authModalTab).toBe('login');

    state = uiReducer(state, closeAuthModal());
    expect(state.isAuthModalOpen).toBe(false);
  });

  it('handles filter updates and reset', () => {
    let state = uiReducer(initial, setCategoryFilter('audio'));
    expect(state.productFilters.category).toBe('audio');

    state = uiReducer(state, setSearchQuery('headphones'));
    expect(state.productFilters.search).toBe('headphones');

    state = uiReducer(state, setSortBy('price_desc'));
    expect(state.productFilters.sortBy).toBe('price_desc');

    state = uiReducer(state, setMaxPrice(5000));
    expect(state.productFilters.maxPrice).toBe(5000);

    state = uiReducer(state, setInStockOnly(true));
    expect(state.productFilters.inStockOnly).toBe(true);

    state = uiReducer(state, resetFilters());
    expect(state.productFilters.category).toBe('all');
    expect(state.productFilters.search).toBe('');
  });
});
