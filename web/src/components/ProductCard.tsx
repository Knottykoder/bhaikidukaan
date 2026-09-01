import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product.js';
import { useCartStore } from '../stores/cartStore.js';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();

  const discount = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`Added ${product.name.substring(0, 24)}... to cart! 🛒`);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="product-card"
      style={{ position: 'relative' }}
    >
      {/* Image Container with Link */}
      <Link
        to={`/product/${product.id}`}
        style={{
          display: 'block',
          position: 'relative',
          aspectRatio: '1/1',
          overflow: 'hidden',
          background: '#0d1017',
        }}
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="product-image-hover"
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {discount > 0 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
              }}
            >
              {discount}% OFF
            </span>
          )}
          {product.badge && (
            <span
              style={{
                background: 'rgba(99, 102, 241, 0.9)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                backdropFilter: 'blur(8px)',
              }}
            >
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.categoryName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
            <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
            <span>{product.rating.toFixed(1)}</span>
            <span style={{ color: '#64748b', fontWeight: 400 }}>({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#f8fafc',
              marginBottom: 12,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price & Action Row */}
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {product.compareAtPrice > product.price && (
              <div style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'line-through' }}>
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'var(--accent-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <ShoppingBag size={16} /> Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
