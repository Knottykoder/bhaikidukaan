import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Phone, Sparkles, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onAuthSuccess?: (() => void) | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(defaultTab !== 'register');

  useEffect(() => {
    if (isOpen && defaultTab) {
      setIsLogin(defaultTab !== 'register');
    }
  }, [isOpen, defaultTab]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isLogin) {
      if (!email || !password) {
        toast.error('Please enter your email and password');
        return;
      }
      const success = await login(email, password);
      if (success) {
        toast.success(`Welcome back, ${email.split('@')[0]}! ✨`);
        onClose();
        if (onAuthSuccess) onAuthSuccess();
      } else {
        const currentError = useAuthStore.getState().error;
        toast.error(currentError || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name || !email || !password) {
        toast.error('Please fill in all required fields');
        return;
      }
      const success = await register(name, email, password, phone);
      if (success) {
        toast.success(`Account created! Welcome, ${name}! 🎉`);
        onClose();
        if (onAuthSuccess) onAuthSuccess();
      } else {
        const currentError = useAuthStore.getState().error;
        toast.error(currentError || 'Registration failed. Please try again.');
      }
    }
  };

  const handleQuickDemoFill = () => {
    if (isLogin) {
      setEmail('mayank@example.com');
      setPassword('password123');
    } else {
      setName('Mayank Sharma');
      setEmail('mayank@example.com');
      setPassword('secure123');
      setPhone('+91 98765 43210');
    }
    toast('Demo details filled!', { icon: '⚡' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 7, 11, 0.82)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 460,
              background: 'linear-gradient(180deg, #161c28 0%, #0e121a 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 24,
              padding: '32px 28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
                {isLogin ? 'Welcome to BhaiKiDukaan' : 'Create Your Account'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {isLogin ? 'Sign in to access your orders, wishlist, and saved addresses' : 'Join thousands of happy customers shopping today'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(10, 14, 22, 0.8)',
                padding: 4,
                borderRadius: 12,
                marginBottom: 24,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  clearError();
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: isLogin ? 'var(--accent-gradient)' : 'transparent',
                  color: isLogin ? '#fff' : '#94a3b8',
                  boxShadow: isLogin ? '0 2px 10px rgba(99, 102, 241, 0.3)' : 'none',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  clearError();
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: !isLogin ? 'var(--accent-gradient)' : 'transparent',
                  color: !isLogin ? '#fff' : '#94a3b8',
                  boxShadow: !isLogin ? '0 2px 10px rgba(99, 102, 241, 0.3)' : 'none',
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Mayank Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: 42 }}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                  <input
                    type="email"
                    placeholder="mayank@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                    Phone Number (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', marginTop: 8, padding: '14px 0', fontSize: '1rem' }}
              >
                {isLoading ? (
                  <span>Please wait...</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isLogin ? 'Sign In to Account' : 'Create Account'} <ArrowRight size={18} />
                  </span>
                )}
              </button>

              {/* Quick Fill Demo Button */}
              <button
                type="button"
                onClick={handleQuickDemoFill}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed rgba(99, 102, 241, 0.4)',
                  color: '#a5b4fc',
                  padding: '10px 0',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={16} /> 1-Click Demo Sign In
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
