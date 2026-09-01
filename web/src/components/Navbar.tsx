import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Sparkles, LogOut, Package, ShieldCheck, Heart } from 'lucide-react';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { getTotalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openLogin } = useAuthModalStore();
  const navigate = useNavigate();

  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Top Announcement Banner */}
        <div
          style={{
            background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
            padding: '7px 0',
            textAlign: 'center',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <span>🚚 FREE EXPRESS DELIVERY ACROSS INDIA ON ORDERS OVER ₹999</span>
          <span style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '1px 8px', borderRadius: 4, fontWeight: 800 }}>
            USE CODE: BKD10 FOR 10% OFF
          </span>
        </div>

        {/* Main Navbar */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 20 }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              <span style={{ fontSize: '1.45rem' }}>🛒</span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#f8fafc',
                }}
              >
                Bhai<span className="gradient-text">KiDukaan</span>
              </span>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', marginTop: -2 }}>
                PREMIUM LIFESTYLE & TECH STORE
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              flex: 1,
              maxWidth: 480,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={18} style={{ position: 'absolute', left: 14, color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search products (Headphones, Smartwatches, Hoodies, Keyboards)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 42, paddingRight: 40, height: 44, fontSize: '0.9rem' }}
            />
          </form>

          {/* Nav Links & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              to="/products"
              style={{
                color: '#cbd5e1',
                fontSize: '0.92rem',
                fontWeight: 600,
                padding: '8px 12px',
                borderRadius: 8,
                transition: 'color 0.2s',
              }}
            >
              Shop All
            </Link>

            <Link
              to="/orders"
              style={{
                color: '#cbd5e1',
                fontSize: '0.92rem',
                fontWeight: 600,
                padding: '8px 12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Package size={17} color="#818cf8" />
              <span>My Orders</span>
            </Link>

            {/* Auth Button or User Menu */}
            {isAuthenticated && user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e293b' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: 220,
                        background: '#121620',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: 14,
                        padding: 8,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                        zIndex: 200,
                      }}
                    >
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          color: '#cbd5e1',
                          fontSize: '0.85rem',
                          borderRadius: 8,
                        }}
                      >
                        <User size={16} /> My Profile & Addresses
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          color: '#cbd5e1',
                          fontSize: '0.85rem',
                          borderRadius: 8,
                        }}
                      >
                        <Package size={16} /> Order History
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          color: '#f87171',
                          fontSize: '0.85rem',
                          borderRadius: 8,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => openLogin()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.88rem', borderRadius: 999 }}
              >
                <User size={15} /> Sign In
              </motion.button>
            )}

            {/* Cart Trigger */}
            <motion.button
              onClick={toggleCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'relative',
                background: 'var(--accent-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0a0c10',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                  }}
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>
    </>
  );
};
