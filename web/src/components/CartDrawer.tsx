import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Zap, Lock } from 'lucide-react';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem, getSubtotal, getTax, getShipping, getTotal, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openRegister } = useAuthModalStore();
  const navigate = useNavigate();

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const total = getTotal();

  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      toast('Please create an account or sign in to complete checkout', { icon: '🔐' });
      openRegister(() => {
        setCartOpen(false);
        navigate('/checkout');
      });
      return;
    }
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 7, 11, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 100vw)',
              background: '#0e121a',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(18, 23, 33, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  Your Cart
                </h3>
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {totalItems}
                </span>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', padding: '40px 0' }}>
                  <ShoppingBag size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
                  <h4 style={{ color: '#f8fafc', marginBottom: 8, fontSize: '1.1rem' }}>Your cart is empty</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>
                    Explore our high-performance products and add your favorites!
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="btn-primary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '14px',
                      background: 'rgba(22, 27, 38, 0.6)',
                      borderRadius: 14,
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 10,
                        objectFit: 'cover',
                        background: '#131822',
                      }}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.3 }}>
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c7d2fe', marginTop: 4 }}>
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: 'rgba(10, 14, 22, 0.8)',
                            borderRadius: 8,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            style={{
                              padding: '4px 8px',
                              color: '#94a3b8',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            style={{
                              padding: '4px 8px',
                              color: '#94a3b8',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          @ ₹{item.product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div
                style={{
                  padding: '20px 24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(14, 18, 26, 0.95)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#f8fafc' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>GST (18%)</span>
                    <span style={{ color: '#f8fafc' }}>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#34d399' : '#f8fafc' }}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#f8fafc',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: '#a5b4fc', fontFamily: 'var(--font-heading)' }}>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceedCheckout}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px 0', fontSize: '1rem' }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
