import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Zap, Lock } from 'lucide-react';
import { Drawer, IconButton, Button, Divider, Chip } from '@mui/material';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
    getTotalItems,
  } = useCartStore();
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
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={() => setCartOpen(false)}
      slotProps={{
        paper: {
          sx: {
            width: 'min(420px, 100vw)',
            bgcolor: '#0d111a',
            color: '#f8fafc',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '-10px 0 35px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(18, 23, 34, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Shopping Cart
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
            </span>
          </div>
        </div>

        <IconButton
          onClick={() => setCartOpen(false)}
          sx={{
            color: '#94a3b8',
            '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255, 255, 255, 0.08)' },
            p: 1,
          }}
        >
          <X size={20} />
        </IconButton>
      </div>

      {/* Cart Items List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                marginBottom: 16,
              }}
            >
              <ShoppingBag size={32} />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
              Your cart is empty
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: 24, maxWidth: 260, lineHeight: 1.5 }}>
              Explore our tech drops and premium essentials to fill your cart!
            </p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setCartOpen(false);
                navigate('/products');
              }}
              sx={{ px: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          items.map(({ product, quantity }) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '12px',
                borderRadius: 16,
                background: 'rgba(18, 23, 34, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <img
                src={
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
                }
                alt={product.name}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  objectFit: 'cover',
                  background: '#090d14',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/product/${product.id}`}
                  onClick={() => setCartOpen(false)}
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    textDecoration: 'none',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {product.name}
                </Link>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                  ₹{product.price.toLocaleString('en-IN')} each
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      padding: 2,
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      style={{
                        width: 24,
                        height: 24,
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ width: 26, textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      style={{
                        width: 24,
                        height: 24,
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <IconButton
                    size="small"
                    onClick={() => removeItem(product.id)}
                    sx={{ color: '#ef4444', p: 0.5 }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#c7d2fe', fontFamily: 'Outfit, sans-serif' }}>
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer / Summary */}
      {items.length > 0 && (
        <div
          style={{
            padding: '18px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(14, 18, 26, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span>Estimated GST & Handling (18%)</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? <strong style={{ color: '#4ade80' }}>FREE</strong> : `₹${shipping}`}</span>
          </div>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 0.5 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
            <span>Total Payable</span>
            <span style={{ fontSize: '1.2rem', color: '#c7d2fe', fontFamily: 'Outfit, sans-serif' }}>
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleProceedCheckout}
            endIcon={<ArrowRight size={18} />}
            sx={{
              py: 1.4,
              fontSize: '0.95rem',
              borderRadius: '14px',
              mt: 1,
              fontWeight: 800,
            }}
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
