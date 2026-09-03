import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Zap, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { type Product } from '../types/product.js';
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
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <Loader2 size={42} color="#818cf8" className="animate-spin" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
          Loading Product Details...
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Fetching fresh specs and inventory.
        </p>
      </div>
    );
  }

  // Not Found / Error State
  if (!currentProduct) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 600 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(22, 27, 38, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: '48px 32px',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#f87171',
            }}
          >
            <AlertCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>
            Product Not Found
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
            {error || "The item you are looking for does not exist in our catalog or may have been removed."}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
              <ShoppingBag size={18} /> Browse All Products
            </Link>
            <Link to="/" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              Go to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const product = currentProduct;
  const discount = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const productImages = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];

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
              src={productImages[selectedImage] || productImages[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </motion.div>

          {/* Thumbnail Strip */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
              {productImages.map((img, idx) => (
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
          {/* Category & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#818cf8',
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '4px 12px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}
            >
              {product.categoryName || 'General'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                {product.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              color: '#f8fafc',
              lineHeight: 1.25,
              marginBottom: 16,
            }}
          >
            {product.name}
          </h1>

          {/* Price Header */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <>
                <span style={{ fontSize: '1.3rem', color: '#64748b', textDecoration: 'line-through' }}>
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: product.inStock ? '#22c55e' : '#ef4444',
                boxShadow: product.inStock ? '0 0 10px #22c55e' : 'none',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: product.inStock ? '#22c55e' : '#ef4444' }}>
              {product.inStock ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: 32 }}>
            {product.description}
          </p>

          {/* Key Features List */}
          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Highlights & Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {product.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Picker & Add to Cart Controls */}
          {product.inStock ? (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#131822',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{
                      width: 38,
                      height: 38,
                      background: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  <span style={{ width: 44, textAlign: 'center', fontWeight: 700, color: '#f8fafc' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    style={{
                      width: 38,
                      height: 38,
                      background: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-primary"
                  style={{ flex: 1, padding: '14px 24px', fontSize: '1rem' }}
                >
                  <ShoppingBag size={20} /> Add to Cart (₹{(product.price * quantity).toLocaleString('en-IN')})
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                }}
              >
                <Zap size={18} color="#ec4899" /> Buy Now
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                textAlign: 'center',
                fontWeight: 600,
                marginBottom: 32,
              }}
            >
              This product is currently out of stock. Check back soon for restock!
            </div>
          )}

          {/* Guarantee Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              padding: '20px 16px',
              borderRadius: 16,
              background: '#131822',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Truck size={22} color="#818cf8" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>Free Express Delivery</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>On orders over ₹999</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ShieldCheck size={22} color="#22c55e" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>1-Year Warranty</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>100% Genuine Brand</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <RefreshCw size={22} color="#ec4899" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>7-Day Returns</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hassle-free pickups</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
