import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, ShoppingBag, Star, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { useAiChatStore } from '../stores/aiChatStore.js';
import { useCartStore } from '../stores/cartStore.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AiAssistant: React.FC = () => {
  const { isOpen, isLoading, messages, suggestedPrompts, toggleChat, setOpen, sendMessage, clearHistory } = useAiChatStore();
  const { addItem } = useCartStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    toast.success(`Added ${product.name.substring(0, 24)}... to cart! 🛒`);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 999,
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 999,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.5), 0 0 20px rgba(236, 72, 153, 0.4)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.95rem',
        }}
        aria-label="Open AI Shopping Assistant"
      >
        <Sparkles size={20} className="animate-pulse" />
        <span>Ask Bhai AI</span>
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #0f172a',
          }}
        />
      </motion.button>

      {/* Expandable Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            style={{
              position: 'fixed',
              bottom: 90,
              right: 24,
              width: 'min(420px, calc(100vw - 32px))',
              height: 'min(620px, calc(100vh - 120px))',
              background: '#0d111a',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 24,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <Bot size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      Bhai AI Assistant
                    </h3>
                    <span
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 999,
                      }}
                    >
                      ONLINE
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    Instant Recommendations & Deal Finder
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={clearHistory}
                  title="Reset conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 8,
                  }}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 8,
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body (Messages List) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Message Bubble */}
                    <div
                      style={{
                        background:
                          msg.role === 'user'
                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                            : 'rgba(22, 27, 38, 0.85)',
                        color: msg.role === 'user' ? '#ffffff' : '#f1f5f9',
                        padding: '12px 16px',
                        borderRadius:
                          msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                        border:
                          msg.role === 'user'
                            ? 'none'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Interactive Product Cards inside Assistant Message */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                        {msg.products.map((product) => {
                          const fallbackImg =
                            product.images?.[0] ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                          return (
                            <div
                              key={product.id}
                              style={{
                                background: 'rgba(14, 18, 26, 0.95)',
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                borderRadius: 14,
                                padding: 10,
                                display: 'flex',
                                gap: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Link
                                to={`/product/${product.id}`}
                                onClick={() => setOpen(false)}
                                style={{ display: 'block', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}
                              >
                                <img
                                  src={fallbackImg}
                                  alt={product.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </Link>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Link
                                  to={`/product/${product.id}`}
                                  onClick={() => setOpen(false)}
                                  style={{
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    color: '#f8fafc',
                                    textDecoration: 'none',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {product.name}
                                </Link>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c7d2fe' }}>
                                    ₹{product.price.toLocaleString('en-IN')}
                                  </span>
                                  {product.compareAtPrice > product.price && (
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleAddToCart(product)}
                                className="btn-primary"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '0.75rem',
                                  borderRadius: 8,
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <ShoppingBag size={14} /> Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(22, 27, 38, 0.6)', borderRadius: 12, width: 'fit-content' }}>
                  <Sparkles size={16} color="#818cf8" className="animate-spin" />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bhai AI is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            {suggestedPrompts && suggestedPrompts.length > 0 && !isLoading && (
              <div
                style={{
                  padding: '8px 14px',
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  background: 'rgba(10, 14, 22, 0.7)',
                }}
              >
                {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: '#c7d2fe',
                      padding: '5px 10px',
                      borderRadius: 999,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '12px 16px',
                background: 'rgba(14, 18, 26, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Bhai AI (e.g. Earbuds under ₹2,000)..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: '#131822',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#f8fafc',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: inputText.trim() ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' : 'rgba(255, 255, 255, 0.08)',
                  color: inputText.trim() ? '#fff' : '#64748b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistant;
