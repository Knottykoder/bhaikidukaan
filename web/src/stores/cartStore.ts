import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type MockProduct } from '../data/mockData.js';
import { API_BASE } from '../api/config.js';

export interface CartItem {
  product: MockProduct;
  quantity: number;
  selectedVariant?: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentId: string;
  razorpayOrderId?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

interface CartState {
  items: CartItem[];
  orders: PlacedOrder[];
  isCartOpen: boolean;
  isLoadingOrders: boolean;

  // Actions
  addItem: (product: MockProduct, quantity?: number, variant?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  createOrder: (address: ShippingAddress, paymentId: string, paymentMethod?: string) => Promise<PlacedOrder>;
  fetchUserOrders: () => Promise<void>;

  // Computed Getters
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      isCartOpen: false,
      isLoadingOrders: false,

      addItem: (product, quantity = 1, variant) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.selectedVariant === variant,
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated, isCartOpen: true };
          } else {
            return {
              items: [...state.items, { product, quantity, selectedVariant: variant }],
              isCartOpen: true,
            };
          }
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),

      createOrder: async (address, paymentId, paymentMethod = 'razorpay') => {
        const state = get();
        const subtotal = state.getSubtotal();
        const tax = state.getTax();
        const shipping = state.getShipping();
        const total = state.getTotal();
        const token = localStorage.getItem('bkd_access_token');

        const orderPayload = {
          items: state.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images?.[0] || '',
            price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          })),
          shippingAddress: address,
          paymentMethod,
          paymentId,
          subtotal,
          shippingCost: shipping,
          tax,
          total,
        };

        try {
          const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(orderPayload),
          });

          if (res.ok) {
            const data = await res.json();
            const created = data.order;
            const formatted: PlacedOrder = {
              id: created.id,
              orderNumber: created.orderNumber,
              items: [...state.items],
              subtotal: created.subtotal,
              tax: created.tax,
              shipping: created.shippingCost,
              total: created.total,
              status: 'CONFIRMED',
              paymentId: created.paymentId || paymentId,
              razorpayOrderId: created.razorpayOrderId,
              shippingAddress: address,
              createdAt: created.createdAt || new Date().toISOString(),
            };

            set((s) => ({
              orders: [formatted, ...s.orders],
              items: [],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('Backend order API call failed, saving to local store:', err);
        }

        // Fallback local order creation
        const orderNumber = 'BKD-' + Math.floor(100000 + Math.random() * 900000);
        const fallbackOrder: PlacedOrder = {
          id: 'ord-' + Math.random().toString(36).substring(2, 9),
          orderNumber,
          items: [...state.items],
          subtotal,
          tax,
          shipping,
          total,
          status: 'CONFIRMED',
          paymentId,
          razorpayOrderId: 'order_rzp_' + Math.random().toString(36).substring(2, 8),
          shippingAddress: address,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          orders: [fallbackOrder, ...s.orders],
          items: [],
        }));

        return fallbackOrder;
      },

      fetchUserOrders: async () => {
        set({ isLoadingOrders: true });
        const token = localStorage.getItem('bkd_access_token');

        try {
          const res = await fetch(`${API_BASE}/orders`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.orders)) {
              const mapped: PlacedOrder[] = data.orders.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                items: (o.items || []).map((i: any) => ({
                  product: {
                    id: i.productId,
                    name: i.productName,
                    slug: '',
                    description: '',
                    price: i.price,
                    compareAtPrice: i.price,
                    currency: 'INR',
                    images: [i.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
                    categoryId: '',
                    categoryName: 'Product',
                    tags: [],
                    stock: 10,
                    inStock: true,
                    rating: 5,
                    reviewCount: 0,
                    features: [],
                  },
                  quantity: i.quantity,
                })),
                subtotal: o.subtotal,
                tax: o.tax,
                shipping: o.shippingCost,
                total: o.total,
                status: o.status === 'ORDER_STATUS_UNSPECIFIED' ? 'CONFIRMED' : o.status || 'CONFIRMED',
                paymentId: o.paymentId,
                razorpayOrderId: o.razorpayOrderId,
                shippingAddress: {
                  name: o.shippingAddress?.name || 'Customer',
                  line1: o.shippingAddress?.line1 || '',
                  city: o.shippingAddress?.city || '',
                  state: o.shippingAddress?.state || '',
                  pincode: o.shippingAddress?.pincode || '',
                  phone: o.shippingAddress?.phone || '',
                },
                createdAt: o.createdAt,
              }));

              set({ orders: mapped, isLoadingOrders: false });
              return;
            }
          }
        } catch (err) {
          console.warn('Failed to fetch orders from backend:', err);
        }

        set({ isLoadingOrders: false });
      },

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      },

      getTax: () => {
        return Math.round(get().getSubtotal() * 0.18); // 18% GST
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal > 999 ? 0 : 99; // Free shipping over ₹999
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax() + get().getShipping();
      },
    }),
    {
      name: 'bkd_cart_store',
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
