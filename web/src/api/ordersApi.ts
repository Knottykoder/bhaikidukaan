import { apiSlice } from './apiSlice.js';
import { type PlacedOrder, type ShippingAddress, type CartItem } from '../stores/cartStore.js';

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  paymentId?: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface CreateOrderResponse {
  order: PlacedOrder;
  razorpayOrderId?: string;
}

export interface OrdersListResponse {
  orders: PlacedOrder[];
  total: number;
  page: number;
  pageSize: number;
}

function normalizeOrder(raw: any): PlacedOrder {
  const o = raw.order || raw;
  const items: CartItem[] = Array.isArray(o.items)
    ? o.items.map((i: any) => ({
        product: {
          id: i.productId || i.id || '',
          name: i.productName || i.name || 'Product',
          slug: '',
          description: '',
          price: Number(i.price || 0),
          compareAtPrice: Number(i.price || 0),
          currency: 'INR',
          images: i.productImage ? [i.productImage] : (i.images || []),
          categoryId: '',
          categoryName: '',
          tags: [],
          stock: 99,
          inStock: true,
          rating: 5,
          reviewCount: 1,
          features: [],
        },
        quantity: Number(i.quantity || 1),
      }))
    : [];

  const addr = o.shippingAddress || {};

  return {
    id: o.id || '',
    orderNumber: o.orderNumber || `BKD-${Date.now()}`,
    items,
    subtotal: Number(o.subtotal || 0),
    tax: Number(o.tax || 0),
    shipping: Number(o.shippingCost || o.shipping || 0),
    total: Number(o.total || 0),
    status: o.status || 'CONFIRMED',
    paymentId: o.paymentId || '',
    razorpayOrderId: o.razorpayOrderId || '',
    shippingAddress: {
      name: addr.name || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      phone: addr.phone || '',
    },
    createdAt: o.createdAt || new Date().toISOString(),
  };
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PlacedOrder[], { page?: number; pageSize?: number; status?: string } | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
        if (params?.status) queryParams.set('status', params.status);
        const qs = queryParams.toString();
        return `/orders${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response.orders) ? response.orders : (Array.isArray(response) ? response : []);
        return rawList.map(normalizeOrder);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getOrderById: builder.query<PlacedOrder, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: any) => normalizeOrder(response),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => ({
        order: normalizeOrder(response.order || response),
        razorpayOrderId: response.razorpayOrderId || response.order?.razorpayOrderId || '',
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'Product'],
    }),

    cancelOrder: builder.mutation<PlacedOrder, { orderId: string; reason?: string }>({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (response: any) => normalizeOrder(response),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useLazyGetOrdersQuery,
  useLazyGetOrderByIdQuery,
} = ordersApi;
