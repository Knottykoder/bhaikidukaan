import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS, type MockProduct } from '../data/mockData.js';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { useProductStore } from '../stores/productStore.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openRegister } = useAuthModalStore();
  const { currentProduct, isDetailLoading, fetchProductById } = useProductStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
      setSelectedImage(0);
    }
  }, [id, fetchProductById]);

  const product = currentProduct || MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const discount = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity}x ${product.name} to cart! 🛒`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    if (!isAuthenticated) {
      toast('Please create an account or sign in to complete your purchase', { icon: '🔐' });
      openRegister(() => {
        navigate('/checkout');
      });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Back breadcrumb */}
      <Link
        to="/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: '#94a3b8',
          fontSize: '0.9rem',
          marginBottom: 32,
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 48,
          alignItems: 'start',
        }}
      >
        {/* Left: Image Gallery */}
        <div>
          {/* Main Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            style={{
              aspectRatio: '1/1',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#0d1017',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: 16,
            }}
          >
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </motion.div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: selectedImage === idx ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: 0,
                    background: '#131822',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {product.categoryName}
            </span>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.25, marginBottom: 16 }}>
            {product.name}
          </h1>

          {/* Rating Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(251, 191, 36, 0.12)', padding: '4px 10px', borderRadius: 8, color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
              <Star size={15} fill="#fbbf24" stroke="#fbbf24" />
              <span>{product.rating.toFixed(1)} / 5.0</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Based on {product.reviewCount} verified buyer reviews
            </span>
          </div>

          {/* Price Block */}
          <div
            style={{
              padding: '18px 24px',
              background: 'rgba(22, 27, 38, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice > product.price && (
                  <span style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through' }}>
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                Inclusive of all taxes (18% GST) • Free Delivery
              </div>
            </div>

            {discount > 0 && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: 10,
                }}
              >
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 24 }}>
            {product.description}
          </p>

          {/* Key Specs Features */}
          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Product Highlights
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {product.features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
            {/* Quantity Stepper */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(14, 18, 26, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '4px',
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: 36,
                  height: 36,
                  border: 'none',
                  background: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ width: 40, textAlign: 'center', fontWeight: 800, color: '#f8fafc' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: 36,
                  height: 36,
                  border: 'none',
                  background: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>

            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.96 }}
              className="btn-secondary"
              style={{ flex: 1, padding: '14px 24px', fontSize: '1rem' }}
            >
              <ShoppingBag size={18} /> Add to Cart
            </motion.button>

            <motion.button
              onClick={handleBuyNow}
              whileTap={{ scale: 0.96 }}
              className="btn-primary"
              style={{ flex: 1.2, padding: '14px 24px', fontSize: '1rem' }}
            >
              <Zap size={18} /> Buy Now
            </motion.button>
          </div>

          {/* Trust Guarantees */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              paddingTop: 20,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <div>
              <Truck size={20} color="#818cf8" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>Free Express Delivery</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dispatch in 24 hours</div>
            </div>
            <div>
              <ShieldCheck size={20} color="#34d399" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>1 Year Warranty</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>100% Genuine Product</div>
            </div>
            <div>
              <RefreshCw size={20} color="#f472b6" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>7-Day Returns</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>No Questions Asked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
