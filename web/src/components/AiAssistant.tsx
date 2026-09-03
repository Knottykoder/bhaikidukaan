import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  Star,
  ArrowRight,
  RotateCcw,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Tag,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAiChatStore, type ChatMessage } from '../stores/aiChatStore.js';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// ============================================
// Typewriter Streaming Component for Human Feel
// ============================================
const TypewriterMessage: React.FC<{
  content: string;
  isStreaming?: boolean;
  onDone?: () => void;
}> = ({ content, isStreaming, onDone }) => {
  const [displayedText, setDisplayedText] = useState(isStreaming ? '' : content);
  const [isTyping, setIsTyping] = useState(Boolean(isStreaming));

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    let index = 0;
    setIsTyping(true);
    const speed = Math.max(8, Math.min(18, Math.floor(1500 / (content.length || 1))));

    const timer = setInterval(() => {
      index += 3;
      if (index >= content.length) {
        setDisplayedText(content);
        setIsTyping(false);
        clearInterval(timer);
        if (onDone) onDone();
      } else {
        setDisplayedText(content.slice(0, index));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [content, isStreaming, onDone]);

  // Format simple markdown (bold, lists, code blocks, headers)
  const formattedElements = useMemo(() => {
    const lines = displayedText.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} style={{ fontSize: '0.94rem', fontWeight: 800, color: '#c7d2fe', marginTop: 10, marginBottom: 4 }}>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginTop: 12, marginBottom: 6 }}>
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', margin: '3px 0' }}>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>•</span>
            <span>{renderFormattedText(line.substring(2))}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={i} style={{ height: 6 }} />;
      }
      return <p key={i} style={{ margin: '3px 0' }}>{renderFormattedText(line)}</p>;
    });
  }, [displayedText]);

  return (
    <div>
      {formattedElements}
      {isTyping && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 14,
            background: '#818cf8',
            marginLeft: 3,
            verticalAlign: 'middle',
            animation: 'blink 0.8s infinite',
          }}
        />
      )}
    </div>
  );
};

// Helper: parse **bold** and `code`
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: '#f8fafc', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#c7d2fe',
            padding: '2px 6px',
            borderRadius: 6,
            fontSize: '0.82rem',
            fontFamily: 'monospace',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ============================================
// Main AI Assistant Component
// ============================================
export const AiAssistant: React.FC = () => {
  const { isOpen, isLoading, messages, suggestedPrompts, toggleChat, setOpen, sendMessage, clearHistory } =
    useAiChatStore();
  const { addItem, items: cartItems } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Optimized for Indian English / Hinglish accent

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setIsListening(false);
          // Auto send voice input for ultra smooth human experience
          handleSendText(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Could not capture voice. Please type your query!');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('🎙️ Listening... Speak your request naturally in Hindi/English!', {
          icon: '👂',
          duration: 3000,
        });
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech (Read Aloud)
  const speakMessage = (msgId: string, text: string) => {
    if (!window.speechSynthesis) {
      toast.error('Speech synthesis not supported in this browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '').replace(/📦|🔥|⚡| Namaste/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) ||
      voices.find((v) => v.lang.includes('en-US'));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Context from current state
    const context = {
      userName: user?.name,
      currentProductName: location.pathname.includes('/product/')
        ? location.pathname.split('/').pop()
        : undefined,
      cartCount: cartItems.length,
    };

    sendMessage(textToSend, context);
    setInputText('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(inputText);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendText(prompt);
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] || 1;
    addItem(product, qty);
    toast.success(`Added ${qty}x ${product.name.substring(0, 22)}... to cart! 🛒`);
  };

  const handleBuyNow = (product: any) => {
    const qty = quantities[product.id] || 1;
    addItem(product, qty);
    setOpen(false);
    navigate('/checkout');
    toast.success(`Redirecting to Express Checkout! ⚡`);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon "${code}" copied to clipboard! ✨`);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  const handleReaction = (msgId: string, reaction: string) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === reaction ? '' : reaction,
    }));
    toast('Thanks for your feedback! 🙌', { icon: '❤️', duration: 1500 });
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
              width: 'min(440px, calc(100vw - 32px))',
              height: 'min(640px, calc(100vh - 120px))',
              background: '#0d111a',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 24,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(99, 102, 241, 0.2)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <Bot size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      Bhai AI Shopping Buddy
                    </h3>
                    <span
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      LIVE 24/7
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                    {user?.name ? `Helping ${user.name}` : 'Human-Like Product Expert & Deals'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={clearHistory}
                  title="Reset conversation"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
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
                gap: 18,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.role === 'user' ? '86%' : '94%',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#a5b4fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Bot size={17} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
                    {/* Message Bubble */}
                    <div
                      style={{
                        background:
                          msg.role === 'user'
                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                            : 'rgba(22, 27, 38, 0.92)',
                        color: msg.role === 'user' ? '#ffffff' : '#f1f5f9',
                        padding: '14px 16px',
                        borderRadius:
                          msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        border:
                          msg.role === 'user'
                            ? 'none'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.role === 'assistant' ? (
                        <TypewriterMessage
                          content={msg.content}
                          isStreaming={msg.isStreaming}
                          onDone={() => {
                            msg.isStreaming = false;
                            scrollToBottom();
                          }}
                        />
                      ) : (
                        msg.content
                      )}
                    </div>

                    {/* Interactive Product Cards inside Assistant Message */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                        {msg.products.map((product) => {
                          const fallbackImg =
                            product.images?.[0] ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                          const qty = quantities[product.id] || 1;

                          return (
                            <div
                              key={product.id}
                              style={{
                                background: 'rgba(15, 20, 30, 0.98)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: 16,
                                padding: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                              }}
                            >
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <Link
                                  to={`/product/${product.id}`}
                                  onClick={() => setOpen(false)}
                                  style={{
                                    display: 'block',
                                    width: 62,
                                    height: 62,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                  }}
                                >
                                  <img
                                    src={fallbackImg}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Link>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        color: '#38bdf8',
                                        background: 'rgba(56, 189, 248, 0.12)',
                                        padding: '1px 6px',
                                        borderRadius: 6,
                                      }}
                                    >
                                      {product.categoryName || 'Top Choice'}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.72rem', color: '#fbbf24' }}>
                                      <Star size={11} fill="#fbbf24" />
                                      <span>{product.rating || 4.8}</span>
                                    </div>
                                  </div>

                                  <Link
                                    to={`/product/${product.id}`}
                                    onClick={() => setOpen(false)}
                                    style={{
                                      fontSize: '0.86rem',
                                      fontWeight: 800,
                                      color: '#f8fafc',
                                      textDecoration: 'none',
                                      display: 'block',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      marginTop: 3,
                                    }}
                                  >
                                    {product.name}
                                  </Link>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                    <span style={{ fontSize: '0.96rem', fontWeight: 900, color: '#a5b4fc' }}>
                                      ₹{product.price.toLocaleString('en-IN')}
                                    </span>
                                    {product.compareAtPrice > product.price && (
                                      <span style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                                        ₹{product.compareAtPrice.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Bar (Quantity Stepper + Add To Cart + Instant Buy) */}
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    padding: '2px 4px',
                                  }}
                                >
                                  <button
                                    onClick={() => handleQuantityChange(product.id, -1)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#94a3b8',
                                      cursor: 'pointer',
                                      width: 24,
                                      height: 24,
                                      fontWeight: 800,
                                    }}
                                  >
                                    -
                                  </button>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', minWidth: 16, textAlign: 'center' }}>
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(product.id, 1)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#94a3b8',
                                      cursor: 'pointer',
                                      width: 24,
                                      height: 24,
                                      fontWeight: 800,
                                    }}
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="btn-primary"
                                  style={{
                                    flex: 1,
                                    padding: '7px 12px',
                                    fontSize: '0.78rem',
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                  }}
                                >
                                  <ShoppingBag size={14} /> Add to Cart
                                </button>

                                <button
                                  onClick={() => handleBuyNow(product)}
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '7px 12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  <Zap size={13} /> Buy
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Assistant Message Controls (Read Aloud + Reactions) */}
                    {msg.role === 'assistant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
                        <button
                          onClick={() => speakMessage(msg.id, msg.content)}
                          title={speakingMsgId === msg.id ? 'Stop reading' : 'Read aloud with voice'}
                          style={{
                            background: speakingMsgId === msg.id ? 'rgba(99, 102, 241, 0.3)' : 'none',
                            border: 'none',
                            color: speakingMsgId === msg.id ? '#818cf8' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 6px',
                            borderRadius: 6,
                          }}
                        >
                          {speakingMsgId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        <div style={{ width: 1, height: 12, background: 'rgba(255, 255, 255, 0.1)' }} />

                        <button
                          onClick={() => handleReaction(msg.id, 'up')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: reactions[msg.id] === 'up' ? '#22c55e' : '#64748b',
                            cursor: 'pointer',
                            padding: 3,
                          }}
                        >
                          <ThumbsUp size={13} />
                        </button>

                        <button
                          onClick={() => handleReaction(msg.id, 'heart')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: reactions[msg.id] === 'heart' ? '#ec4899' : '#64748b',
                            cursor: 'pointer',
                            padding: 3,
                          }}
                        >
                          <Heart size={13} fill={reactions[msg.id] === 'heart' ? '#ec4899' : 'none'} />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      <User size={17} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '10px 16px',
                    background: 'rgba(22, 27, 38, 0.8)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 16,
                    width: 'fit-content',
                  }}
                >
                  <Sparkles size={16} color="#818cf8" className="animate-spin" />
                  <span style={{ fontSize: '0.82rem', color: '#c7d2fe', fontWeight: 600 }}>
                    Bhai AI is typing recommendations...
                  </span>
                </div>
              )}

              {/* Active Voice Listening Wave Banner */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
                    border: '1px solid #ec4899',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#ec4899',
                      boxShadow: '0 0 10px #ec4899',
                    }}
                    className="animate-ping"
                  />
                  <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 700 }}>
                    Listening... Speak your query now (Hindi / English)!
                  </span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            {suggestedPrompts && suggestedPrompts.length > 0 && !isLoading && (
              <div
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(10, 14, 22, 0.8)',
                }}
              >
                {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.28)',
                      color: '#c7d2fe',
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar with Voice Button & Send */}
            <form
              onSubmit={handleFormSubmit}
              style={{
                padding: '12px 16px',
                background: 'rgba(14, 18, 26, 0.98)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop recording' : 'Voice search (speak naturally)'}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: isListening
                    ? 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)'
                    : 'rgba(99, 102, 241, 0.15)',
                  border: isListening
                    ? '1px solid #ec4899'
                    : '1px solid rgba(99, 102, 241, 0.3)',
                  color: isListening ? '#ffffff' : '#a5b4fc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Bhai AI (or speak with mic)..."
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
                  background: inputText.trim()
                    ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: inputText.trim() ? '#fff' : '#64748b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
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
