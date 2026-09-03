import { apiSlice } from './apiSlice.js';

export interface CreateRazorpayOrderRequest {
  amount: number;
  currency?: string;
  orderId?: string;
}

export interface CreateRazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId?: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId?: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  payment?: any;
}

export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<CreateRazorpayOrderResponse, CreateRazorpayOrderRequest>({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
    }),

    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    getPaymentStatus: builder.query<any, string>({
      query: (orderId) => `/payments/${orderId}`,
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useGetPaymentStatusQuery,
  useLazyGetPaymentStatusQuery,
} = paymentsApi;
