import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isCartDrawerOpen: boolean;
  isAiChatOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  productFilters: {
    category: string;
    search: string;
    sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating';
    maxPrice: number;
    inStockOnly: boolean;
  };
}

const initialState: UiState = {
  isCartDrawerOpen: false,
  isAiChatOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  productFilters: {
    category: 'all',
    search: '',
    sortBy: 'featured',
    maxPrice: 10000,
    inStockOnly: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartDrawerOpen = action.payload;
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    setAiChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isAiChatOpen = action.payload;
    },
    toggleAiChat: (state) => {
      state.isAiChatOpen = !state.isAiChatOpen;
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'register' | undefined>) => {
      state.isAuthModalOpen = true;
      state.authModalTab = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.productFilters.category = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.productFilters.search = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'featured' | 'price_asc' | 'price_desc' | 'rating'>) => {
      state.productFilters.sortBy = action.payload;
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.productFilters.maxPrice = action.payload;
    },
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.productFilters.inStockOnly = action.payload;
    },
    resetFilters: (state) => {
      state.productFilters = initialState.productFilters;
    },
  },
});

export const {
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
} = uiSlice.actions;

export default uiSlice.reducer;
