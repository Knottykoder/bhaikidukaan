import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Package, Sparkles, Menu as MenuIcon, X } from 'lucide-react';
import { Badge, IconButton, Tooltip, Avatar, Button } from '@mui/material';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const { getTotalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openLogin } = useAuthModalStore();
  const navigate = useNavigate();

  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 12, 16, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
      }}
    >
      {/* Top Announcement Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          padding: '6px 16px',
          textAlign: 'center',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span>🚚 FREE EXPRESS DELIVERY ACROSS INDIA ON ORDERS OVER ₹999</span>
        <span
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: '0.7rem',
            fontWeight: 800,
          }}
        >
          USE CODE: BHAI20 FOR 20% OFF
        </span>
      </div>

      {/* Main Navbar Bar */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
          gap: 16,
          width: '100%',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🛒</span>
          </div>
          <div>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.35rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#f8fafc',
              }}
            >
              Bhai<span className="gradient-text">KiDukaan</span>
            </span>
            <div
              style={{
                fontSize: '0.66rem',
                color: '#94a3b8',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginTop: -3,
              }}
            >
              PREMIUM LIFESTYLE & TECH
            </div>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex"
          style={{
            flex: 1,
            maxWidth: 460,
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: 14,
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search audio gear, smartwatches, hoodies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              paddingLeft: 42,
              paddingRight: 16,
              borderRadius: 12,
              background: 'rgba(18, 23, 34, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </form>

        {/* Right Navigation & Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Mobile Search Toggle */}
          <IconButton
            className="flex md:hidden"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            sx={{ color: '#cbd5e1', p: 1 }}
          >
            {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </IconButton>

          <Link
            to="/products"
            className="hidden sm:inline-flex"
            style={{
              color: '#cbd5e1',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Shop All
          </Link>

          <Link
            to="/orders"
            style={{
              color: '#cbd5e1',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 8,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Package size={17} color="#818cf8" />
            <span className="hidden sm:inline">Orders</span>
          </Link>

          {/* User Profile Menu or Sign In Button */}
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <Avatar
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                  alt={user.name}
                  sx={{ width: 26, height: 26, fontSize: '0.75rem', bgcolor: '#334155' }}
                />
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    maxWidth: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  className="hidden sm:inline"
                >
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
                      borderRadius: 16,
                      padding: 8,
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
                      zIndex: 200,
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </div>
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
                        textDecoration: 'none',
                      }}
                    >
                      <User size={15} /> My Profile & Addresses
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
                        textDecoration: 'none',
                      }}
                    >
                      <Package size={15} /> Order History
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
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => openLogin()}
              startIcon={<User size={15} />}
              sx={{
                borderRadius: 999,
                fontSize: '0.82rem',
                padding: '5px 14px',
              }}
            >
              Sign In
            </Button>
          )}

          {/* Cart Trigger with Material UI Badge */}
          <Tooltip title="View Cart" arrow>
            <IconButton
              onClick={toggleCart}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                color: '#ffffff',
                width: 42,
                height: 42,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Badge
                badgeContent={totalItems}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    height: 18,
                    minWidth: 18,
                  },
                }}
              >
                <ShoppingBag size={19} color="#ffffff" />
              </Badge>
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Mobile Search Input Drawer (Visible when toggled on mobile) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden"
            style={{
              padding: '10px 16px 14px',
              background: 'rgba(14, 18, 26, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  height: 40,
                  padding: '0 14px',
                  borderRadius: 10,
                  background: '#131822',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ height: 40, minWidth: 70 }}>
                Search
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
