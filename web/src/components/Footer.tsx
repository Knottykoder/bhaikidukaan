import React from 'react';
import { Shield, Truck, RefreshCw, Headphones, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: '#07090e',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 60,
        paddingBottom: 40,
        marginTop: 80,
      }}
    >
      <div className="container">
        {/* Customer Trust Highlights Banner */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 38, 0.8) 0%, rgba(14, 18, 26, 0.9) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 20,
            padding: '28px',
            marginBottom: 50,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Truck size={22} color="#818cf8" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: 2 }}>Free Express Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Complimentary delivery on all prepaid & eligible orders.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={22} color="#34d399" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: 2 }}>100% Genuine Products</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Direct from verified manufacturers with full warranty.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RefreshCw size={22} color="#f472b6" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: 2 }}>7-Day Easy Returns</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Hassle-free doorstep returns and instant refunds.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Headphones size={22} color="#38bdf8" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: 2 }}>24/7 Priority Support</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Dedicated help desk ready for any order assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 30,
            paddingBottom: 40,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🛒</span>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
                Bhai<span className="gradient-text">KiDukaan</span>
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16 }}>
              India's premier online store for high-end audio, cyber gear, streetwear apparel, and workspace lifestyle collections.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              Explore Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: '#94a3b8' }}>
              <li><Link to="/products" style={{ color: '#cbd5e1' }}>All Products</Link></li>
              <li><Link to="/products?category=cat-electronics" style={{ color: '#cbd5e1' }}>Electronics & Audio</Link></li>
              <li><Link to="/products?category=cat-fashion" style={{ color: '#cbd5e1' }}>Streetwear Apparel</Link></li>
              <li><Link to="/products?category=cat-home" style={{ color: '#cbd5e1' }}>Workspace & Keyboards</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              Customer Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: '#94a3b8' }}>
              <li><Link to="/orders" style={{ color: '#cbd5e1' }}>Track Your Order</Link></li>
              <li><Link to="/profile" style={{ color: '#cbd5e1' }}>My Account & Addresses</Link></li>
              <li><span style={{ color: '#cbd5e1' }}>Shipping Policy</span></li>
              <li><span style={{ color: '#cbd5e1' }}>7-Day Returns & Exchanges</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.82rem',
            color: '#64748b',
          }}
        >
          <div>
            © 2026 BhaiKiDukaan. All rights reserved. Crafted with <Heart size={14} color="#ec4899" style={{ display: 'inline', verticalAlign: 'middle' }} /> for shoppers across India.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Razorpay Secure Payment Gateway</span>
            <span>•</span>
            <span>100% Buyer Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
