import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Truck, RefreshCw, Star, Heart, CheckCircle2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery } from '../api/productsApi.js';

export const Home: React.FC = () => {
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } = useGetFeaturedProductsQuery(4);
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();


  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '70px 0 90px',
          overflow: 'hidden',
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '650px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 80%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Top Curated Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '6px 18px',
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c7d2fe' }}>
              Special Festive Drops & Top Trending Picks
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 22,
              letterSpacing: '-0.03em',
            }}
          >
            Elevate Your Everyday With <br />
            <span className="gradient-text">Curated Premium Lifestyle & Tech</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.22rem)',
              color: '#94a3b8',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Explore high-fidelity wireless audio, premium heavyweight streetwear, custom mechanical keyboards, and smart daily accessories at unbeatable prices.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <Link to="/products" className="btn-primary" style={{ padding: '14px 34px', fontSize: '1.05rem' }}>
              <ShoppingBag size={20} /> Shop All Collections <ArrowRight size={18} />
            </Link>
            <a
              href="#why-us"
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.05rem' }}
            >
              Why BhaiKiDukaan?
            </a>
          </motion.div>

          {/* Customer Trust Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              marginTop: 60,
              padding: '22px 30px',
              background: 'rgba(22, 27, 38, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 24,
              maxWidth: 960,
              margin: '60px auto 0',
            }}
          >
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
                50,000+
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Happy Shoppers Across India</div>
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Star size={22} fill="#fbbf24" stroke="#fbbf24" /> 4.9 / 5.0
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Over 12,000+ Verified Reviews</div>
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                100% Genuine
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Authentic Quality Guaranteed</div>
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
                24-48h
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Fast Dispatch & Free Shipping</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ padding: '50px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Curated Collections
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                Shop by Category
              </h2>
            </div>
            <Link to="/products" style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 20,
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  style={{
                    position: 'relative',
                    height: 240,
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 24,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textDecoration: 'none',
                  }}
                >
                  <img
                    src={cat.imageUrl}
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
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(10, 12, 16, 0.95) 0%, rgba(10, 12, 16, 0.3) 60%, transparent 100%)',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                      {cat.productCount} Products
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: 2, marginBottom: 4 }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                      {cat.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'rgba(22, 27, 38, 0.4)',
                borderRadius: 16,
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontSize: '0.92rem',
              }}
            >
              Categories are loading or syncing. Check out all products in the catalog!
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section style={{ padding: '50px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Hand-Picked For You
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                Trending & Bestselling Picks
              </h2>
            </div>
            <Link to="/products" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Explore Catalog
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: 'rgba(22, 27, 38, 0.5)',
                borderRadius: 20,
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <ShoppingBag size={40} color="#818cf8" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
                Fresh Drops Coming Soon
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

      {/* Why Shop With Us Trust Section */}
      <section id="why-us" style={{ padding: '80px 0', background: 'rgba(14, 18, 26, 0.5)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: '#818cf8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: 8,
              }}
            >
              THE BHAIKIDUKAAN PROMISE
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>
              Why Customers Love Shopping With Us
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              We are committed to delivering premium quality products with an unmatched shopping and delivery experience.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            <div
              style={{
                background: 'rgba(22, 27, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '30px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Truck size={28} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                Free Express Delivery
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Orders above ₹999 qualify for complimentary express delivery with live doorstep tracking.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(22, 27, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '30px 24px',
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
                  margin: '0 auto 16px',
                }}
              >
                <ShieldCheck size={28} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                100% Genuine & Covered
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Every item is rigorously tested and covered with our standard 1-year brand warranty.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(22, 27, 38, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '30px 24px',
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
                  margin: '0 auto 16px',
                }}
              >
                <RefreshCw size={28} color="#f472b6" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                7-Day Easy Returns
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Not satisfied with your order? Return or exchange with zero hassles and instant refund processing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
