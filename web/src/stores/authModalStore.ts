import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  defaultTab: 'login' | 'register';
  /** Optional callback called after successful auth */
  onAuthSuccess: (() => void) | null;

  openLogin: (onSuccess?: () => void) => void;
  openRegister: (onSuccess?: () => void) => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  defaultTab: 'login',
  onAuthSuccess: null,

  openLogin: (onSuccess) =>
    set({ isOpen: true, defaultTab: 'login', onAuthSuccess: onSuccess || null }),

  openRegister: (onSuccess) =>
    set({ isOpen: true, defaultTab: 'register', onAuthSuccess: onSuccess || null }),

  close: () =>
    set({ isOpen: false, onAuthSuccess: null }),
}));
