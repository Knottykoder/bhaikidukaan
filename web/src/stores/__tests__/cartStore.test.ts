import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '../cartStore.js';
import { Product } from '../../types/product.js';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Sony WH-1000XM5 Noise Canceling Headphones',
  slug: 'sony-wh-1000xm5',
  description: 'Industry-leading noise cancellation',
  price: 24999,
  compareAtPrice: 29999,
  currency: 'INR',
  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
  categoryId: 'cat-audio',
  categoryName: 'Wireless Audio',
  tags: ['bestseller'],
  stock: 12,
  inStock: true,
  rating: 4.9,
  reviewCount: 142,
  features: ['ANC', '30hr Battery'],
};

const mockAffordableProduct: Product = {
  id: 'prod-2',
  name: 'Fast USB-C Braided Cable',
  slug: 'fast-usbc-cable',
  description: '100W PD charging cable',
  price: 499,
  compareAtPrice: 799,
  currency: 'INR',
  images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761'],
  categoryId: 'cat-acc',
  categoryName: 'Accessories',
  tags: [],
  stock: 50,
  inStock: true,
  rating: 4.7,
  reviewCount: 30,
  features: ['100W PD'],
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.setState({ isCartOpen: false, orders: [] });
  });

  it('starts with an empty cart and closed drawer', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getTotalItems()).toBe(0);
    expect(state.getSubtotal()).toBe(0);
    expect(state.getTax()).toBe(0);
    expect(state.getShipping()).toBe(0);
    expect(state.getTotal()).toBe(0);
    expect(state.isCartOpen).toBe(false);
  });

  it('adds an item to cart and opens drawer', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    const state = useCartStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe('prod-1');
    expect(state.items[0].quantity).toBe(1);
    expect(state.getTotalItems()).toBe(1);
    expect(state.getSubtotal()).toBe(24999);
    expect(state.isCartOpen).toBe(true);
  });

  it('stacks quantity when adding identical product', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    useCartStore.getState().addItem(mockProduct, 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.getTotalItems()).toBe(3);
    expect(state.getSubtotal()).toBe(24999 * 3);
  });

  it('calculates 18% GST tax correctly', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    const state = useCartStore.getState();

    const expectedTax = Math.round(24999 * 0.18);
    expect(state.getTax()).toBe(expectedTax);
  });

  it('provides free shipping for orders > ₹999 and ₹99 shipping for small orders', () => {
    // Affordable item below ₹999 threshold
    useCartStore.getState().addItem(mockAffordableProduct, 1);
    let state = useCartStore.getState();
    expect(state.getSubtotal()).toBe(499);
    expect(state.getShipping()).toBe(99);
    expect(state.getTotal()).toBe(499 + Math.round(499 * 0.18) + 99);

    // Now add another item to exceed ₹999
    useCartStore.getState().addItem(mockAffordableProduct, 2); // 499 * 3 = 1497
    state = useCartStore.getState();
    expect(state.getSubtotal()).toBe(1497);
    expect(state.getShipping()).toBe(0); // Free shipping!
  });

  it('updates quantity and removes item if quantity reaches 0', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    useCartStore.getState().updateQuantity('prod-1', 4);

    expect(useCartStore.getState().items[0].quantity).toBe(4);

    // Reduce to 0 -> should remove
    useCartStore.getState().updateQuantity('prod-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes item by ID and clears cart', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    useCartStore.getState().addItem(mockAffordableProduct, 1);

    expect(useCartStore.getState().items).toHaveLength(2);

    useCartStore.getState().removeItem('prod-1');
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].product.id).toBe('prod-2');

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('toggles and controls cart drawer visibility', () => {
    expect(useCartStore.getState().isCartOpen).toBe(false);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(true);

    useCartStore.getState().setCartOpen(false);
    expect(useCartStore.getState().isCartOpen).toBe(false);
  });

  it('creates an order with fallback local generation and clears cart', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network offline'));
    useCartStore.getState().addItem(mockProduct, 1);

    const address = {
      name: 'Hemant Kumar',
      line1: 'Flat 402, Skyline Towers',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      phone: '9876543210',
    };

    const order = await useCartStore.getState().createOrder(address, 'pay_test123');

    expect(order).toBeDefined();
    expect(order.orderNumber).toMatch(/^BKD-/);
    expect(order.items).toHaveLength(1);
    expect(order.status).toBe('CONFIRMED');
    expect(order.shippingAddress.name).toBe('Hemant Kumar');

    // Cart items should be cleared upon successful order creation
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().orders).toHaveLength(1);
  });

  it('handles backend order creation when API responds successfully', async () => {
    const mockCreatedOrder = {
      id: 'ord-backend-1',
      orderNumber: 'BKD-998877',
      subtotal: 24999,
      tax: 4500,
      shippingCost: 0,
      total: 29499,
      paymentId: 'pay_backend_1',
      createdAt: '2026-09-07T00:00:00.000Z',
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ order: mockCreatedOrder }),
    } as any);

    useCartStore.getState().addItem(mockProduct, 1);

    const address = {
      name: 'Hemant',
      line1: 'Line 1',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '9999999999',
    };

    const order = await useCartStore.getState().createOrder(address, 'pay_backend_1');
    expect(order.orderNumber).toBe('BKD-998877');
    expect(useCartStore.getState().orders[0].id).toBe('ord-backend-1');
  });

  it('fetches user orders from API successfully', async () => {
    const mockOrdersList = [
      {
        id: 'ord-101',
        orderNumber: 'BKD-101',
        items: [{ productId: 'prod-1', productName: 'Headphones', price: 24999, quantity: 1 }],
        subtotal: 24999,
        tax: 4500,
        shippingCost: 0,
        total: 29499,
        status: 'CONFIRMED',
        paymentId: 'pay_1',
        shippingAddress: { name: 'Hemant' },
        createdAt: '2026-09-07T00:00:00.000Z',
      },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ orders: mockOrdersList }),
    } as any);

    await useCartStore.getState().fetchUserOrders();
    expect(useCartStore.getState().orders).toHaveLength(1);
    expect(useCartStore.getState().orders[0].orderNumber).toBe('BKD-101');
  });
});
