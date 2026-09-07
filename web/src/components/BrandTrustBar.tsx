import React from 'react';
import { motion } from 'framer-motion';

interface BrandItem {
  name: string;
  tagline?: string;
}

const BRANDS: BrandItem[] = [
  { name: 'APPLE' },
  { name: 'SAMSUNG' },
  { name: 'SONY' },
  { name: 'boAt' },
  { name: 'KEYCHRON' },
  { name: 'LOGITECH' },
  { name: 'JBL' },
  { name: 'NOISE' },
];

export const BrandTrustBar: React.FC = () => {
  return (
    <section style={{ padding: '20px 0 40px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#64748b',
              letterSpacing: '0.12em',
            }}
          >
            AUTHORISED RETAIL PARTNERS & DIRECT WARRANTY ASSURANCE
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(20px, 4vw, 48px)',
            flexWrap: 'wrap',
            padding: '16px 24px',
            background: 'rgba(18, 23, 34, 0.45)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 18,
          }}
        >
          {BRANDS.map((brand, idx) => (
            <div
              key={idx}
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#94a3b8',
                opacity: 0.75,
                transition: 'all 0.25s ease',
                cursor: 'default',
                userSelect: 'none',
                fontFamily: 'Outfit, var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.opacity = '0.75';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {brand.name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrandTrustBar;
