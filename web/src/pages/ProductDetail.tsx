import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Zap,
  Check,
  Star,
  Heart,
  CreditCard,
  Headphones,
  Info,
  Clock,
  ThumbsUp,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore.js';
import { useGetProductByIdQuery, useGetFeaturedProductsQuery } from '../api/productsApi.js';
import { ProductCard } from '../components/ProductCard.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorOption {
  name: string;
  hex: string;
  imageIndex: number;
}

const COLOR_OPTIONS: ColorOption[] = [
  { name: 'Sky Blue', hex: '#3b82f6', imageIndex: 0 },
  { name: 'Rose Pink', hex: '#f472b6', imageIndex: 1 },
  { name: 'Mint Green', hex: '#34d399', imageIndex: 2 },
  { name: 'Space Gray', hex: '#475569', imageIndex: 3 },
];

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const {
    data: currentProduct,
    isLoading: isDetailLoading,
    error: queryError,
  } = useGetProductByIdQuery(id || '', { skip: !id });

  const { data: relatedProducts = [] } = useGetFeaturedProductsQuery(4);

  const error = queryError ? ((queryError as any)?.data?.error || 'Product not found') : null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('specs');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedColor(COLOR_OPTIONS[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Loading State
  if (isDetailLoading) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <Loader2 size={44} color="#60a5fa" className="animate-spin" style={{ margin: '0 auto 18px' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
          Loading Product Details...
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Connecting to Product Service catalog.
        </p>
      </div>
    );
  }

  // Not Found / Error State
  if (!currentProduct) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(18, 23, 34, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '40px 32px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ef4444',
            }}
          >
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
            Product Not Found
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.6 }}>
            {error || "The item you are looking for might have been moved or doesn't exist in our catalog."}
          </p>
          <Link to="/products" className="btn-primary" style={{ padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </motion.div>
      </div>
    );
  }

  const product = currentProduct;

  // Curate Gallery Images
  const baseImg = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  const galleryImages: string[] = product.images && product.images.length >= 4
    ? product.images.slice(0, 4)
    : [
        baseImg,
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      ];

  const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);

  const handleColorSelect = (color: ColorOption) => {
    setSelectedColor(color);
    if (color.imageIndex < galleryImages.length) {
      setSelectedImage(color.imageIndex);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    toast.success(`Added ${quantity}x ${product.name} to your cart! 🛒`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast('Added to your wishlist! ❤️', { icon: '✨' });
    } else {
      toast('Removed from wishlist', { icon: '🗑️' });
    }
  };

  return (
    <div style={{ padding: '24px 0 80px' }}>
      <div className="container">
        {/* ============================================================ */}
        {/* 1. BREADCRUMBS TRAIL (Home > Shop > Category > Product)      */}
        {/* ============================================================ */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.84rem',
            color: '#94a3b8',
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
            Home
          </Link>
          <ChevronRight size={14} color="#64748b" />
          <Link to="/products" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
            Shop
          </Link>
          <ChevronRight size={14} color="#64748b" />
          <Link
            to={`/products?category=${product.categoryId}`}
            style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            {product.categoryName || 'Headphones'}
          </Link>
          <ChevronRight size={14} color="#64748b" />
          <span style={{ color: '#60a5fa', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
            {product.name}
          </span>
        </nav>

        {/* ============================================================ */}
        {/* 2. MAIN 2-COLUMN PRODUCT HERO (Gallery + Buy Box)            */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'start',
            marginBottom: 60,
          }}
        >
          {/* Left Column: Media Showcase & Thumbnail Strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Primary Showcase Image Card */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 24,
                overflow: 'hidden',
                background: 'radial-gradient(circle at center, #151c2e 0%, #0c101a 80%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={galleryImages[selectedImage] || baseImg}
                alt={product.name}
                style={{
                  width: '88%',
                  height: '88%',
                  objectFit: 'contain',
                  transition: 'transform 0.4s ease',
                  filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6))',
                }}
              />

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? '#ef4444' : 'transparent'}
                  color={isWishlisted ? '#ef4444' : '#e2e8f0'}
                />
              </button>

              {/* Badge Overlay */}
              {discount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    padding: '4px 12px',
                    borderRadius: 999,
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Row (4 Cards, Active Highlight) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#0d111a',
                    border: selectedImage === idx
                      ? '2px solid #3b82f6'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: selectedImage === idx ? '0 0 16px rgba(59, 130, 246, 0.45)' : 'none',
                    padding: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: selectedImage === idx ? 1 : 0.65,
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Title, Pricing, Swatches & Buy Box */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Category Tag */}
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#60a5fa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              {product.categoryName || 'Headphones & Audio'}
            </span>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.16,
                letterSpacing: '-0.02em',
                marginBottom: 12,
              }}
            >
              {product.name}
            </h1>

            {/* Brief Description */}
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 16 }}>
              {product.description || 'Premium high-fidelity audio engineering with ultra-low latency, custom acoustic drivers, and all-day ergonomic comfort.'}
            </p>

            {/* Star Rating & Review Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                ))}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                {product.rating?.toFixed(1) || '4.9'}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                ({product.reviewCount || 258} Reviews)
              </span>
            </div>

            {/* Price Block & Weekend Discount Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice > product.price && (
                <span style={{ fontSize: '1.35rem', color: '#64748b', textDecoration: 'line-through' }}>
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Discount Only For This Weekend
              </span>
            </div>

            {/* Color Swatches Selector ("Pick a Color") */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>
                Pick a Color:{' '}
                <span style={{ color: '#60a5fa', fontWeight: 800 }}>{selectedColor.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {COLOR_OPTIONS.map((col) => {
                  const isSelected = selectedColor.name === col.name;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => handleColorSelect(col)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: col.hex,
                        border: isSelected ? '2px solid #ffffff' : '2px solid transparent',
                        outline: isSelected ? '2px solid #3b82f6' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      title={col.name}
                    >
                      {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Urgency Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
              {/* Stepper */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#121622',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  padding: '4px 6px',
                  height: 44,
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: 32,
                    height: 32,
                    background: 'transparent',
                    border: 'none',
                    color: quantity <= 1 ? '#475569' : '#f8fafc',
                    fontSize: '1.2rem',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  -
                </button>
                <span style={{ width: 36, textAlign: 'center', fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 15, quantity + 1))}
                  disabled={quantity >= (product.stock || 15)}
                  style={{
                    width: 32,
                    height: 32,
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  +
                </button>
              </div>

              {/* Urgency Message (Inspired by Reference) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                }}
              >
                <Zap size={15} className="animate-pulse" />
                <span>Only 10 Items Left, Hurry up!</span>
              </div>
            </div>

            {/* Dual CTA Action Buttons (Solid Buy Now + Outlined Add to Cart) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
              {/* Buy Now (Primary Solid) */}
              <button
                type="button"
                onClick={handleBuyNow}
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Buy Now
              </button>

              {/* Add to Cart (Outlined) */}
              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: isAdded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: isAdded ? '1px solid #10b981' : '1px solid #3b82f6',
                  color: isAdded ? '#34d399' : '#60a5fa',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isAdded) {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdded) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* 3 Benefit Micro-Cards (Stacked List Underneath, from Reference) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '18px',
                background: 'rgba(18, 23, 34, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Truck size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>Free Delivery</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Free delivery service provided on this purchase</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CreditCard size={18} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>Secure Payments</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Top secure payments services available (UPI & Cards)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Headphones size={18} color="#a78bfa" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>24/7 Support</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Our customer support center and Bhai AI available for help</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. TABBED INFORMATION SECTION (Description, Specs, Reviews)  */}
        {/* ============================================================ */}
        <section style={{ marginBottom: 70 }}>
          {/* Tab Headers */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: 32,
            }}
          >
            {[
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Additional Information' },
              { key: 'reviews', label: 'Reviews (258)' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    position: 'relative',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: isActive ? '#60a5fa' : '#94a3b8',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: '#3b82f6',
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div
            style={{
              background: 'rgba(18, 23, 34, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: 'clamp(20px, 4vw, 36px)',
            }}
          >
            {/* Panel: Additional Information (4-Column Structured Specs Table from Reference) */}
            {activeTab === 'specs' && (
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.88rem',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                        }}
                      >
                        <th style={{ padding: '14px 18px', borderTopLeftRadius: 12, fontWeight: 800 }}>Specification</th>
                        <th style={{ padding: '14px 18px', fontWeight: 800 }}>Details</th>
                        <th style={{ padding: '14px 18px', fontWeight: 800 }}>More Info</th>
                        <th style={{ padding: '14px 18px', borderTopRightRadius: 12, fontWeight: 800 }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { spec: 'Weight', details: '384.8 g', more: 'Lightweight design', remarks: 'Comfort fit' },
                        { spec: 'Dimensions', details: '187.3 × 168.6 × 83.4 mm', more: 'Compact build', remarks: 'Travel friendly' },
                        { spec: 'Material', details: 'Aluminium & Breathable Mesh', more: 'Premium acoustic seal', remarks: 'Ultra durable' },
                        { spec: 'Colors', details: 'Space Gray, Silver, Sky Blue, Pink', more: 'Multiple matte options', remarks: 'Trendy & sleek' },
                        { spec: 'Battery Life', details: 'Up to 24 hours playback', more: 'Fast charging (10m = 3h)', remarks: 'USB Type-C' },
                        { spec: 'Connectivity', details: 'Bluetooth 5.3 + Dual Pairing', more: 'Low-latency lossless codec', remarks: 'Multi-device sync' },
                        { spec: 'Warranty', details: '1 Year Brand Warranty', more: 'Doorstep replacement service', remarks: 'Global support' },
                      ].map((row, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: 700, color: '#f8fafc' }}>{row.spec}</td>
                          <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{row.details}</td>
                          <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{row.more}</td>
                          <td style={{ padding: '14px 18px', color: '#60a5fa', fontWeight: 600 }}>{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Panel: Description */}
            {activeTab === 'description' && (
              <div style={{ color: '#cbd5e1', lineHeight: 1.75, fontSize: '0.95rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>
                  Acoustic Masterpiece Engineered For Perfection
                </h3>
                <p style={{ marginBottom: 16 }}>
                  {product.description || 'Experience the perfect balance of exhilarating high-fidelity audio and the effortless magic of next-generation wireless technology. From cushion to canopy, every component is designed for an uncompromising fit that creates the optimal acoustic seal for many different head shapes.'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 24 }}>
                  {[
                    { title: 'Lossless Fidelity', desc: 'Custom-designed dynamic transducer produces a wide frequency range.' },
                    { title: 'Active Noise Cancellation', desc: 'Six outward-facing microphones detect environmental noise to cancel it out.' },
                    { title: 'Transparency Mode', desc: 'Press the noise control button to let outside sound in naturally.' },
                    { title: 'Personalized Spatial Audio', desc: 'Dynamic head tracking provides theater-like sound for movies and music.' },
                  ].map((feat, i) => (
                    <div key={i} style={{ padding: 16, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa', marginBottom: 4 }}>{feat.title}</h4>
                      <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel: Reviews */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
                      4.9
                    </div>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="#fbbf24" stroke="#fbbf24" />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Based on 258 verified customer reviews</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    {
                      name: 'Aarav Sharma',
                      city: 'Bengaluru',
                      rating: 5,
                      date: '2 days ago',
                      comment: 'Absolute top-tier sound stage and bass depth. The build quality feels ultra premium and noise cancellation is genuinely on par with the best flagship headphones on the market.',
                    },
                    {
                      name: 'Sneha Patel',
                      city: 'Mumbai',
                      rating: 5,
                      date: '1 week ago',
                      comment: 'Delivery arrived in Mumbai within 36 hours! The sky blue color is gorgeous and battery life easily lasted me 3 full work days with ANC on. Highly recommend BhaiKiDukaan!',
                    },
                  ].map((rev, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '18px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <strong style={{ color: '#f8fafc', fontSize: '0.94rem' }}>{rev.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#34d399', marginLeft: 8 }}>✓ Verified Buyer ({rev.city})</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{rev.date}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} size={14} fill="#fbbf24" stroke="#fbbf24" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. RELATED PRODUCTS SHOWCASE (from Reference)                */}
        {/* ============================================================ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                YOU MAY ALSO LIKE
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2rem)', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                Related Products
              </h2>
            </div>
            <Link
              to="/products"
              style={{
                color: '#60a5fa',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              View Catalog <ChevronRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {relatedProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
