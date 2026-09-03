import { apiSlice } from './apiSlice.js';
import { type UserProfile, type AddressItem } from '../stores/authStore.js';

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AddAddressRequest {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['UserProfile', 'Order'],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/profile',
      transformResponse: (response: any) => response.user || response,
      providesTags: ['UserProfile'],
    }),

    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.user || response,
      invalidatesTags: ['UserProfile'],
    }),

    addAddress: builder.mutation<AddressItem[], AddAddressRequest>({
      query: (body) => ({
        url: '/auth/addresses',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.addresses || response,
      invalidatesTags: ['UserProfile'],
    }),

    deleteAddress: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/auth/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useLazyGetProfileQuery,
} = authApi;
