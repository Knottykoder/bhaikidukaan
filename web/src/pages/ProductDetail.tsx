import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Zap, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@mui/material';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import { useGetProductByIdQuery } from '../api/productsApi.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openRegister } = useAuthModalStore();

  const {
    data: currentProduct,
    isLoading: isDetailLoading,
    error: queryError,
  } = useGetProductByIdQuery(id || '', { skip: !id });

  const error = queryError ? ((queryError as any)?.data?.error || 'Product not found') : null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [id]);

  // Loading State
  if (isDetailLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Loader2 size={42} color="#818cf8" className="animate-spin mx-auto mb-5" />
        <h2 className="text-slate-100 text-2xl font-extrabold mb-2">
          Loading Product Details...
        </h2>
        <p className="text-slate-400 text-sm">
          Fetching specs and inventory from Product Service.
        </p>
      </div>
    );
  }

  // Not Found / Error State
  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-card/80 border border-white/10 rounded-3xl p-10 shadow-2xl backdrop-blur-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 mb-2">
            Product Not Found
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || "The item you are looking for might have been moved or doesn't exist."}
          </p>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/products"
            startIcon={<ArrowLeft size={16} />}
          >
            Back to Catalog
          </Button>
        </motion.div>
      </div>
    );
  }

  const product = currentProduct;
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];
  const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);

  // Parse specifications/highlights from attributes or features
  const rawAttributes = (product as any).attributes;
  const specsList: string[] = [];
  if (rawAttributes && typeof rawAttributes === 'object') {
    Object.entries(rawAttributes).forEach(([k, v]) => {
      if (v) specsList.push(`${k}: ${v}`);
    });
  }
  if (specsList.length === 0 && Array.isArray(product.features) && product.features.length > 0) {
    specsList.push(...product.features);
  }
  if (specsList.length === 0) {
    specsList.push(
      '1-Year Official Brand Warranty included',
      'High-Fidelity Audio Drivers & Low-Latency Sync',
      'Doorstep 7-Day Hassle-Free Replacement',
    );
  }


  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity}x ${product.name} to cart! 🛒`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Back Link */}
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#94a3b8',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main 2-Column Product Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 500px) 1fr',
          gap: 48,
          alignItems: 'start',
        }}
        className="product-detail-container"
      >
        {/* Left Column: Product Images Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Large Image Card */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#0d111a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={images[selectedImage] || images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Thumbnail Selector Row */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 14,
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    padding: 0,
                    border: selectedImage === idx
                      ? '2px solid #818cf8'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: selectedImage === idx ? '0 0 12px rgba(129, 140, 248, 0.5)' : 'none',
                    opacity: selectedImage === idx ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    background: '#0d111a',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Form */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Category Pill & Rating Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span
              style={{
                background: 'rgba(99, 102, 241, 0.18)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: 999,
              }}
            >
              {product.categoryName || 'ELECTRONICS & AUDIO'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.9rem' }}>
              <span style={{ color: '#fbbf24', fontWeight: 800 }}>★ {product.rating.toFixed(1)}</span>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>({product.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Product Title */}
          <h1
            style={{
              fontSize: 'clamp(1.85rem, 3.2vw, 2.4rem)',
              fontWeight: 900,
              color: '#f8fafc',
              lineHeight: 1.22,
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            {product.name}
          </h1>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <>
                <span style={{ fontSize: '1.25rem', color: '#64748b', textDecoration: 'line-through' }}>
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '3px 9px',
                    borderRadius: 6,
                  }}
                >
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: product.inStock ? '#22c55e' : '#ef4444',
                boxShadow: product.inStock ? '0 0 10px #22c55e' : 'none',
              }}
            />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: product.inStock ? '#22c55e' : '#ef4444' }}>
              {product.inStock ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Product Description */}
          <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.65, marginBottom: 28 }}>
            {product.description}
          </p>

          {/* Highlights & Specifications */}
          <div style={{ marginBottom: 32 }}>
            <h4
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#f8fafc',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 12,
              }}
            >
              HIGHLIGHTS & SPECIFICATIONS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {specsList.map((spec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Add to Cart Row */}
          {product.inStock && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {/* Quantity Stepper */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#121622',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 14,
                    padding: '4px 6px',
                    height: 48,
                  }}
                >
                  <button
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    style={{
                      width: 32,
                      height: 32,
                      background: 'transparent',
                      border: 'none',
                      color: quantity >= product.stock ? '#475569' : '#f8fafc',
                      fontSize: '1.2rem',
                      cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.94rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart (₹{(product.price * quantity).toLocaleString('en-IN')})</span>
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(30, 24, 45, 0.85)',
                  color: '#f8fafc',
                  border: '1px solid rgba(236, 72, 153, 0.35)',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Zap size={17} color="#ec4899" />
                <span>Buy Now</span>
              </button>
            </div>
          )}

          {/* Trust Badges Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              padding: '18px 20px',
              borderRadius: 18,
              background: 'rgba(18, 23, 34, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Truck size={22} color="#818cf8" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>Free Express Delivery</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>On orders over ₹999</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <ShieldCheck size={22} color="#34d399" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>1-Year Warranty</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>100% Genuine Brand</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <RefreshCw size={22} color="#ec4899" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>7-Day Returns</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>Hassle-free pickups</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
