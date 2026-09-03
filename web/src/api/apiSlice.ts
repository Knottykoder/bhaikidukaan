import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE } from './config.js';

// ============================================
// Base RTK Query API Slice
// Centralized caching, tag invalidation & token auth
// ============================================

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('bkd_access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'Order', 'UserProfile', 'AiChat'],
  endpoints: () => ({}),
});
