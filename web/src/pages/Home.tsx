import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Zap,
  Lock,
  Headphones,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';
import { FlashSaleBanner } from '../components/FlashSaleBanner.js';
import { BrandTrustBar } from '../components/BrandTrustBar.js';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery } from '../api/productsApi.js';
import heroShowcaseImg from '../assets/hero-tech-showcase.jpg';

const CURATED_CATEGORIES = [
  {
    id: 'audio',
    name: 'Wireless Audio',
    count: '32 Products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    tag: 'Trending',
  },
  {
    id: 'wearables',
    name: 'Smart Watches',
    count: '24 Products',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    tag: 'Hot Drop',
  },
  {
    id: 'keyboards',
    name: 'Mechanical Keyboards',
    count: '18 Products',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    tag: 'Custom',
  },
  {
    id: 'smartphones',
    name: 'Smartphones & Gear',
    count: '28 Products',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    tag: 'Flagship',
  },
  {
    id: 'gaming',
    name: 'Gaming & Desks',
    count: '19 Products',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
    tag: 'Pro Esports',
  },
  {
    id: 'accessories',
    name: 'Everyday Essentials',
    count: '42 Products',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80',
    tag: 'Must Haves',
  },
];

export const Home: React.FC = () => {
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } = useGetFeaturedProductsQuery(8);
  const { data: categories = [] } = useGetCategoriesQuery();

  const displayCategories = categories.length > 0 ? categories : CURATED_CATEGORIES;

  return (
    <div>
      {/* ============================================================ */}
      {/* 1. HERO SECTION (2-Column Split Inspired by Reference)       */}
      {/* ============================================================ */}
      <section
        style={{
          position: 'relative',
          padding: '40px 0 60px',
          overflow: 'hidden',
        }}
      >
        {/* Atmospheric Blue Lighting Glow */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '5%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 70%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(32px, 5vw, 64px)',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Typography & High-Converting CTAs */}
            <div>
              {/* Badge Pill */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(37, 99, 235, 0.14)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  padding: '6px 16px',
                  borderRadius: 999,
                  marginBottom: 20,
                }}
              >
                <Sparkles size={15} color="#60a5fa" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  NEW DROP 2026 • FESTIVE TECH COLLECTION
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  fontSize: 'clamp(2.5rem, 5.2vw, 4.4rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  marginBottom: 18,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                }}
              >
                Upgrade Your <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Everyday Tech
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.18rem)',
                  color: '#94a3b8',
                  maxWidth: 540,
                  marginBottom: 32,
                  lineHeight: 1.65,
                }}
              >
                Discover premium gadgets, studio-grade wireless audio, mechanical keyboards, and daily gear engineered for performance, durability, and modern style.
              </motion.p>

              {/* Dual Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}
              >
                <Link
                  to="/products"
                  className="btn-primary"
                  style={{
                    padding: '14px 32px',
                    fontSize: '1rem',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Shop Now <ArrowRight size={18} />
                </Link>

                <a
                  href="#categories"
                  className="btn-secondary"
                  style={{
                    padding: '14px 28px',
                    fontSize: '1rem',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Explore Collection
                </a>
              </motion.div>

              {/* Social Proof Stack (Avatar Cluster + 50K+ Shoppers) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 18px',
                  background: 'rgba(18, 23, 34, 0.55)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 999,
                  width: 'fit-content',
                }}
              >
                {/* Overlapping Avatar Stack */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
                  ].map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Customer"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        objectFit: 'cover',
                        border: '2px solid #0a0d14',
                        marginLeft: i > 0 ? -10 : 0,
                      }}
                    />
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#fbbf24" stroke="#fbbf24" />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                      4.9 / 5.0
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Over 50,000+ Happy Customers Across India
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Hero Visual Showcase with Floating Glassmorphic Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 440,
              }}
            >
              {/* Product Hero Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 520,
                  aspectRatio: '1 / 1',
                  borderRadius: 28,
                  overflow: 'hidden',
                  background: 'radial-gradient(circle at center, rgba(30, 58, 138, 0.4) 0%, rgba(10, 14, 26, 0.9) 80%)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(37, 99, 235, 0.2)',
                }}
              >
                <img
                  src={heroShowcaseImg}
                  alt="Premium Tech Showcase"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Floating Glassmorphic Pill 1 (Top-Right): Free Express Delivery */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  position: 'absolute',
                  top: 24,
                  right: -12,
                  zIndex: 3,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: 16,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Truck size={20} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                    Free Express Delivery
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Across 19,000+ Pin Codes
                  </div>
                </div>
              </motion.div>

              {/* Floating Glassmorphic Pill 2 (Bottom-Left): 100% Genuine & Covered */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: -12,
                  zIndex: 3,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: 16,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={20} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                    100% Genuine & Covered
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    1-Year Official Warranty
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TRUST PILLARS BAR (5 Items Horizontal Strip)              */}
      {/* ============================================================ */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 16,
              background: 'rgba(18, 23, 34, 0.65)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: '20px 24px',
            }}
          >
            {[
              { icon: Truck, color: '#60a5fa', title: 'Free Express Shipping', desc: 'On all orders above ₹999' },
              { icon: RefreshCw, color: '#a78bfa', title: '7-Day Easy Returns', desc: 'Instant doorstep exchange' },
              { icon: Lock, color: '#34d399', title: 'Secure Payments', desc: '100% encrypted UPI & cards' },
              { icon: Headphones, color: '#f472b6', title: '24/7 Bhai AI Support', desc: 'Instant live guidance' },
              { icon: ShieldCheck, color: '#fbbf24', title: 'Official Warranty', desc: '1-Year brand coverage' },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={20} color={item.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', marginBottom: 2 }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SHOP BY CATEGORY SECTION                                 */}
      {/* ============================================================ */}
      <section id="categories" style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                CURATED CATEGORIES
              </span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                Shop by Category
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
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {displayCategories.map((cat: any, index: number) => (
              <motion.div
                key={cat.id || index}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  to={`/products?category=${cat.id}`}
                  style={{
                    position: 'relative',
                    height: 220,
                    borderRadius: 20,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 22,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textDecoration: 'none',
                    background: '#0d111a',
                  }}
                >
                  <img
                    src={cat.image || cat.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.name}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    className="product-image-hover"
                  />
                  {/* Subtle Gradient Veil */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(10, 13, 20, 0.95) 0%, rgba(10, 13, 20, 0.35) 55%, transparent 100%)',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#93c5fd',
                        background: 'rgba(37, 99, 235, 0.3)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        display: 'inline-block',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      {cat.count || `${cat.productCount || 20} Products`}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 2 }}>
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FEATURED PRODUCTS GRID (Inspired by Reference)           */}
      {/* ============================================================ */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                HAND-PICKED DROPS
              </span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                Featured Products
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
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: 'rgba(18, 23, 34, 0.5)',
                borderRadius: 20,
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <ShoppingBag size={40} color="#60a5fa" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
                Curating New Tech Drops...
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 20 }}>
                Explore our full catalog to discover all currently in-stock products.
              </p>
              <Link to="/products" className="btn-primary" style={{ padding: '10px 24px' }}>
                Explore All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FLASH SALE COUNTDOWN BANNER                              */}
      {/* ============================================================ */}
      <FlashSaleBanner />

      {/* ============================================================ */}
      {/* 6. BEST SELLERS / TRENDING SPOTLIGHT (Compact Cards)        */}
      {/* ============================================================ */}
      {featuredProducts.length >= 4 && (
        <section style={{ padding: '30px 0 50px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  TOP RATED BY CUSTOMERS
                </span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2rem)', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                  Best Sellers
                </h2>
              </div>
              <Link
                to="/products?sort=bestselling"
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
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                gap: 16,
              }}
            >
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 7. BRAND TRUST STRIP                                        */}
      {/* ============================================================ */}
      <BrandTrustBar />

      {/* ============================================================ */}
      {/* 8. WHY SHOP WITH US / THE BHAIKIDUKAAN PROMISE             */}
      {/* ============================================================ */}
      <section style={{ padding: '70px 0', background: 'rgba(10, 14, 22, 0.6)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                color: '#60a5fa',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: 8,
              }}
            >
              THE BHAIKIDUKAAN PROMISE
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.3rem)', fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>
              Built For Genuine Quality & Unmatched Speed
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
              We partner directly with authorized distributors to eliminate counterfeits and deliver an authentic shopping experience.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            <div
              style={{
                background: 'rgba(18, 23, 34, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '32px 26px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(37, 99, 235, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <Truck size={28} color="#60a5fa" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                Free Express Delivery
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Every order over ₹999 is shipped via insured express couriers with real-time doorstep SMS tracking.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(18, 23, 34, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '32px 26px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <ShieldCheck size={28} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                100% Genuine & Covered
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Direct brand sourcing with authentic serial codes and our standard 1-year replacement warranty.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(18, 23, 34, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '32px 26px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(236, 72, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <RefreshCw size={28} color="#f472b6" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                7-Day Hassle-Free Returns
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Not 100% satisfied? Return or exchange with zero interrogation and instant refund to your source account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
