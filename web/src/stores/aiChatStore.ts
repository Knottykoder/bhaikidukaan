import { create } from 'zustand';
import { type Product } from '../types/product.js';
import { API_BASE } from '../api/config.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: string;
}

interface AiChatState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  suggestedPrompts: string[];

  // Actions
  toggleChat: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: `Namaste! 🙏 I'm **Bhai AI**, your personal shopping assistant. Looking for top-rated audio gear, smart gadgets, or budget deals? Ask me anything!`,
    timestamp: new Date().toISOString(),
  },
];

const INITIAL_PROMPTS = [
  '🎧 Best Wireless Earbuds under ₹2,500',
  '🔥 Trending Deals Today',
  '⚡ High-Performance Smartwatches',
  '📦 Track my order (BKD-...)',
];

export const useAiChatStore = create<AiChatState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  messages: INITIAL_MESSAGES,
  suggestedPrompts: INITIAL_PROMPTS,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  clearHistory: () =>
    set({
      messages: INITIAL_MESSAGES,
      suggestedPrompts: INITIAL_PROMPTS,
    }),

  sendMessage: async (text: string) => {
    if (!text.trim() || get().isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }));

    try {
      const historyPayload = get().messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          role: 'assistant',
          content: data.reply || 'Here are some top picks for you!',
          products: Array.isArray(data.products) ? data.products : [],
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, assistantMsg],
          suggestedPrompts: data.suggestedPrompts || INITIAL_PROMPTS,
          isLoading: false,
        }));
        return;
      }
    } catch (err) {
      console.warn('AI Chat API error, using fallback:', err);
    }

    // Client fallback reply if network fails
    const fallbackMsg: ChatMessage = {
      id: 'msg-' + (Date.now() + 1),
      role: 'assistant',
      content: `I couldn't reach the live AI server right now, but feel free to browse our full catalog anytime or check your cart!`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, fallbackMsg],
      isLoading: false,
    }));
  },
}));
