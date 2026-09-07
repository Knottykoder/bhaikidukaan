import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Copy, Check, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const FlashSaleBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);

  // Set target date 3 days ahead, persistent across refreshes
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 58,
  });

  useEffect(() => {
    // Live ticking countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 2, hours: 12, minutes: 45, seconds: 0 }; // Loop for demo
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('BHAI20');
    setCopied(true);
    toast.success('Coupon code BHAI20 copied to clipboard! 🎉');
    setTimeout(() => setCopied(false), 2500);
  };

  const formatUnit = (val: number) => String(val).padStart(2, '0');

  return (
    <section style={{ padding: '30px 0 50px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            background: 'linear-gradient(135deg, #090e1a 0%, #0d1b38 50%, #15244d 100%)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            boxShadow: '0 20px 50px -10px rgba(13, 27, 56, 0.7), 0 0 40px rgba(59, 130, 246, 0.15)',
            padding: '36px 32px',
          }}
        >
          {/* Subtle Ambient Radial Glows */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '15%',
              width: 380,
              height: 380,
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              left: '10%',
              width: 260,
              height: 260,
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 32,
              flexWrap: 'wrap',
            }}
          >
            {/* Left Info Column */}
            <div style={{ flex: '1 1 360px', maxWidth: 520 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 999,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 16,
                }}
              >
                <Zap size={15} className="animate-pulse" />
                <span>LIMITED FLASH SALE • UP TO 60% OFF</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                }}
              >
                Grab Flagship Tech At <br />
                <span style={{ color: '#60a5fa' }}>Unbeatable Festive Prices</span>
              </h2>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '0.94rem',
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Special limited inventory on noise-cancelling headphones, high-precision mechanical keyboards, and daily gear. Includes standard 1-Year Brand Warranty!
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Link
                  to="/products"
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                    padding: '12px 24px',
                    fontSize: '0.94rem',
                    borderRadius: 12,
                  }}
                >
                  Shop Flash Deals <ArrowRight size={17} />
                </Link>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 18px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px dashed rgba(255, 255, 255, 0.25)',
                    borderRadius: 12,
                    color: '#e2e8f0',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#60a5fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)')}
                >
                  {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} color="#60a5fa" />}
                  <span>USE CODE: <strong style={{ color: '#60a5fa' }}>BHAI20</strong></span>
                </button>
              </div>
            </div>

            {/* Center / Right: Live Countdown Display & Featured Highlight */}
            <div
              style={{
                flex: '1 1 340px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                    letterSpacing: '0.1em',
                  }}
                >
                  DEAL EXPIRES IN
                </span>
              </div>

              {/* Countdown Digits Matrix */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {[
                  { label: 'Days', value: formatUnit(timeLeft.days) },
                  { label: 'Hours', value: formatUnit(timeLeft.hours) },
                  { label: 'Minutes', value: formatUnit(timeLeft.minutes) },
                  { label: 'Seconds', value: formatUnit(timeLeft.seconds) },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 16,
                      minWidth: 70,
                      padding: '12px 10px',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: index === 3 ? '#60a5fa' : '#f8fafc',
                        fontFamily: 'Outfit, sans-serif',
                        lineHeight: 1.1,
                      }}
                    >
                      {item.value}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        marginTop: 4,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Verified Deal Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: '#cbd5e1',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px 16px',
                  borderRadius: 999,
                }}
              >
                <Headphones size={15} color="#60a5fa" />
                <span>Over 1,200+ audio & gear orders claimed today</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
