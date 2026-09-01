import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight, ShoppingBag, Lock, UserCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { motion } from 'framer-motion';

export const Orders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const successOrderId = searchParams.get('success');
  const { orders, isLoadingOrders, fetchUserOrders } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { openLogin, openRegister } = useAuthModalStore();
  const navigate = useNavigate();

  // If user is not authenticated, prompt sign in popup
  useEffect(() => {
    if (!isAuthenticated) {
      openLogin();
    } else {
      fetchUserOrders();
    }
  }, [isAuthenticated, openLogin, fetchUserOrders]);

  // Protected State if user is guest
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 640 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(22, 27, 38, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 24,
            padding: '48px 32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#818cf8',
            }}
          >
            <Lock size={34} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>
            Sign In to View Orders
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
            You need an active BhaiKiDukaan account to view your past orders, track real-time shipments, and manage deliveries.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <button
              onClick={() => openLogin()}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => openRegister()}
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              Create New Account
            </button>
          </div>

          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Continue browsing products <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Success Notification Banner if just placed */}
      {successOrderId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={28} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                Order Placed Successfully! 🎉
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                Your payment has been verified. We are preparing your order for express dispatch!
              </p>
            </div>
          </div>
          <span className="badge badge-success" style={{ padding: '6px 14px' }}>
            CONFIRMED
          </span>
        </motion.div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc' }}>
          My Order History
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Logged in as <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{user?.name || user?.email}</span> • Track real-time shipment status, view order receipts, and manage deliveries.
        </p>
      </div>

      {/* Loading Skeleton State */}
      {isLoadingOrders ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'rgba(22, 27, 38, 0.7)',
                borderRadius: 20,
                padding: '24px 28px',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: 180, height: 22, borderRadius: 6, background: 'rgba(255, 255, 255, 0.1)' }} />
                  <div style={{ width: 260, height: 14, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)' }} />
                </div>
                <div style={{ width: 90, height: 28, borderRadius: 14, background: 'rgba(99, 102, 241, 0.2)' }} />
              </div>

              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 12, background: 'rgba(255, 255, 255, 0.08)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div style={{ width: '45%', height: 16, borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)' }} />
                  <div style={{ width: '25%', height: 14, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(22, 27, 38, 0.5)',
            borderRadius: 20,
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <Package size={54} color="#475569" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: 8 }}>No orders placed yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>
            Explore our curated store and find your next favorite item!
          </p>
          <Link to="/products" className="btn-primary">
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'rgba(22, 27, 38, 0.7)',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Order Card Header */}
              <div
                style={{
                  padding: '20px 24px',
                  background: 'rgba(14, 18, 26, 0.8)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
                      Order #{order.orderNumber}
                    </span>
                    <span className="badge badge-success">
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} • Payment Reference: <span style={{ color: '#a5b4fc' }}>{order.paymentId}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
                    ₹{order.total.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items Total
                  </div>
                </div>
              </div>

              {/* Status Progress Bar */}
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} /> Order Placed
                  </span>
                  <span style={{ color: '#818cf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} /> Processing & Quality Check
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={16} /> Out for Delivery
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} /> Delivered
                  </span>
                </div>
                {/* Progress Line */}
                <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #6366f1 100%)', borderRadius: 999 }} />
                </div>
              </div>

              {/* Items List */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {order.items.map((item) => (
                  <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.name}
                      style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', background: '#131822' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                        {item.product.name}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
                        Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address Summary */}
              <div
                style={{
                  padding: '16px 24px',
                  background: 'rgba(14, 18, 26, 0.5)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <strong>Delivering To:</strong> {order.shippingAddress.name}, {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </div>
                <div>
                  <strong>Contact:</strong> {order.shippingAddress.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
