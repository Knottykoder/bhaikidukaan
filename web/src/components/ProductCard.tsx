import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Heart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product.js';
import { useCartStore } from '../stores/cartStore.js';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const discount = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    toast.success(`Added ${product.name.substring(0, 24)}... to cart! 🛒`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast('Saved to your wishlist! ❤️', { icon: '✨' });
    } else {
      toast('Removed from wishlist', { icon: '🗑️' });
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  const productImage = product.images?.[0] || fallbackImage;

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 14px',
          background: 'rgba(18, 23, 34, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          transition: 'all 0.2s ease',
        }}
      >
        <Link to={`/product/${product.id}`} style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#0a0d14' }}>
          <img src={productImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
              {product.name}
            </h4>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
              {product.rating?.toFixed(1) || '4.8'} ({product.reviewCount || 42})
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            color: '#60a5fa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          title="Quick Add to Cart"
        >
          {isAdded ? <Check size={16} color="#34d399" /> : <ShoppingBag size={16} />}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="product-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(18, 23, 34, 0.85)',
        backdropFilter: 'blur(16px)',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Top Image Container */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', backgroundColor: '#0d1017' }}>
        <Link
          to={`/product/${product.id}`}
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        >
          <img
            src={productImage}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            className="product-image-hover"
          />
        </Link>

        {/* Badges Overlay (Top-Left) */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 5 }}>
          {discount > 0 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: 999,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                letterSpacing: '0.02em',
              }}
            >
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span
              style={{
                background: product.badge === 'BESTSELLER' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'rgba(16, 185, 129, 0.9)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.7rem',
                padding: '3px 9px',
                borderRadius: 999,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top-Right) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 6,
            width: 34,
            height: 34,
            borderRadius: 999,
            background: 'rgba(14, 18, 26, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            size={16}
            fill={isWishlisted ? '#ef4444' : 'transparent'}
            color={isWishlisted ? '#ef4444' : '#cbd5e1'}
          />
        </button>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {product.categoryName || 'Tech & Lifestyle'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>
              {product.rating?.toFixed(1) || '4.8'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              ({product.reviewCount || 48})
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '0.96rem',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: 12,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em',
              lineHeight: 1.4,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#60a5fa')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#f8fafc')}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: '1.28rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.compareAtPrice > product.price && (
            <span style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'line-through' }}>
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* High-Impact Add to Cart Action Button (Full Width, Inspired by Reference) */}
        <div style={{ marginTop: 'auto' }}>
          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 12,
              background: isAdded
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: isAdded
                ? '0 4px 14px rgba(16, 185, 129, 0.4)'
                : '0 4px 16px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isAdded) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isAdded
                ? '0 4px 14px rgba(16, 185, 129, 0.4)'
                : '0 4px 16px rgba(37, 99, 235, 0.35)';
            }}
          >
            {isAdded ? (
              <>
                <Check size={16} /> Added!
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
