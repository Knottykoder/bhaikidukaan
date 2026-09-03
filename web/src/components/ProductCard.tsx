import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chip, Rating, Tooltip, Button } from '@mui/material';
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
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(18, 23, 34, 0.85)',
        backdropFilter: 'blur(16px)',
        width: '100%',
      }}
    >
      {/* Image Container with Link */}
      <Link
        to={`/product/${product.id}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          backgroundColor: '#0d1017',
        }}
      >
        <img
          src={
            product.images?.[0] ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
          }
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="product-image-hover"
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 10, flexWrap: 'wrap' }}>
          {discount > 0 && (
            <Chip
              label={`${discount}% OFF`}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.72rem',
                height: 24,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
              }}
            />
          )}
          {product.badge && (
            <Chip
              label={product.badge}
              size="small"
              sx={{
                background: 'rgba(99, 102, 241, 0.9)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
                backdropFilter: 'blur(8px)',
              }}
            />
          )}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.categoryName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Rating
              value={product.rating}
              precision={0.1}
              size="small"
              readOnly
              sx={{ fontSize: '0.9rem', color: '#fbbf24' }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: 12,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em',
              lineHeight: 1.4,
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price & Action Row */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {product.compareAtPrice > product.price && (
              <div style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'line-through' }}>
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <Tooltip title="Add to Cart" arrow>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              startIcon={<ShoppingBag size={15} />}
              sx={{
                fontSize: '0.82rem',
                padding: '5px 14px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              Add
            </Button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
