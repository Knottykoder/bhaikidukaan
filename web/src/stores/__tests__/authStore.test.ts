import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore.js';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
    vi.restoreAllMocks();
  });

  it('initializes in unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clears session on logout', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'test@bhaikidukaan.com', name: 'Bhai' },
      accessToken: 'token-123',
      isAuthenticated: true,
    });
    localStorage.setItem('bkd_access_token', 'token-123');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('bkd_access_token')).toBeNull();
  });

  it('handles error state and clearError', () => {
    useAuthStore.setState({ error: 'Invalid credentials' });
    expect(useAuthStore.getState().error).toBe('Invalid credentials');

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('handles successful login flow', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 'u1', email: 'test@bhaikidukaan.com', name: 'Bhai' },
        tokens: { accessToken: 'jwt-access-123', refreshToken: 'jwt-refresh-123' },
      }),
    } as any);

    const success = await useAuthStore.getState().login('test@bhaikidukaan.com', 'password123');
    expect(success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Bhai');
    expect(localStorage.getItem('bkd_access_token')).toBe('jwt-access-123');
  });

  it('handles failed login flow', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid password' }),
    } as any);

    const success = await useAuthStore.getState().login('test@bhaikidukaan.com', 'wrongpassword');
    expect(success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().error).toBe('Invalid password');
  });

  it('handles successful register flow', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 'u2', email: 'newuser@bhaikidukaan.com', name: 'New Bhai' },
        tokens: { accessToken: 'jwt-new-123', refreshToken: 'jwt-new-refresh' },
      }),
    } as any);

    const success = await useAuthStore.getState().register('New Bhai', 'newuser@bhaikidukaan.com', 'password123');
    expect(success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('New Bhai');
  });

  it('handles updateUserProfile', async () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'test@bhaikidukaan.com', name: 'Old Name', phone: '111' },
      accessToken: 'token-123',
    });

    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) } as any);

    const updated = await useAuthStore.getState().updateUserProfile('New Name', '9999999999');
    expect(updated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('New Name');
    expect(useAuthStore.getState().user?.phone).toBe('9999999999');
  });

  it('handles addAddress and deleteAddress', async () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'test@bhaikidukaan.com',
        name: 'Bhai',
        addresses: [{ id: 'addr-1', label: 'Home', line1: 'Sector 14', city: 'Gurugram', state: 'HR', pincode: '122001' }],
      },
      accessToken: 'token-123',
    });

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        address: { id: 'addr-2', label: 'Work', line1: 'Cyber City', city: 'Gurugram', state: 'HR', pincode: '122002' },
      }),
    } as any);

    const added = await useAuthStore.getState().addAddress({
      label: 'Work',
      line1: 'Cyber City',
      city: 'Gurugram',
      state: 'HR',
      pincode: '122002',
    });
    expect(added).toBe(true);

    const deleted = await useAuthStore.getState().deleteAddress('addr-1');
    expect(deleted).toBe(true);
  });

  it('handles fetchProfile when token is available', async () => {
    useAuthStore.setState({ accessToken: 'token-123' });

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 'u1', email: 'test@bhaikidukaan.com', name: 'Profile Name', addresses: [] },
      }),
    } as any);

    await useAuthStore.getState().fetchProfile();
    expect(useAuthStore.getState().user?.name).toBe('Profile Name');
  });

  it('handles registration failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email already in use' }),
    } as any);

    const success = await useAuthStore.getState().register('Dup User', 'dup@bhaikidukaan.com', 'pass123');
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe('Email already in use');
  });

  it('handles updateUserProfile when no token is present', async () => {
    useAuthStore.setState({ accessToken: null });
    const res = await useAuthStore.getState().updateUserProfile('Test', '12345');
    expect(res).toBe(false);
  });
});
