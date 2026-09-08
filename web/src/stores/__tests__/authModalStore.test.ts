import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthModalStore } from '../authModalStore.js';

describe('useAuthModalStore', () => {
  beforeEach(() => {
    useAuthModalStore.getState().close();
  });

  it('initializes in closed state', () => {
    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.defaultTab).toBe('login');
    expect(state.onAuthSuccess).toBeNull();
  });

  it('opens login modal and sets callback', () => {
    const cb = vi.fn();
    useAuthModalStore.getState().openLogin(cb);

    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.defaultTab).toBe('login');
    expect(state.onAuthSuccess).toBe(cb);
  });

  it('opens register modal', () => {
    useAuthModalStore.getState().openRegister();

    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.defaultTab).toBe('register');
  });

  it('closes modal and resets callback', () => {
    useAuthModalStore.getState().openLogin(() => {});
    useAuthModalStore.getState().close();

    const state = useAuthModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.onAuthSuccess).toBeNull();
  });
});
