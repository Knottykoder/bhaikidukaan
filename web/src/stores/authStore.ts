import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = 'http://localhost:4000/api';

export interface AddressItem {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  addresses?: AddressItem[];
  createdAt?: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  updateUserProfile: (name: string, phone: string) => Promise<boolean>;
  addAddress: (addr: Omit<AddressItem, 'id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ isLoading: false, error: data.error || 'Login failed' });
            return false;
          }

          const userData: UserProfile = {
            id: data.user?.id || '',
            email: data.user?.email || email,
            name: data.user?.name || '',
            phone: data.user?.phone || '',
            avatarUrl:
              data.user?.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
            addresses: data.user?.addresses || [],
            createdAt: data.user?.createdAt,
          };

          const token = data.tokens?.accessToken || '';
          localStorage.setItem('bkd_access_token', token);

          set({
            user: userData,
            accessToken: token,
            refreshToken: data.tokens?.refreshToken || '',
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch full profile with addresses
          get().fetchProfile();

          return true;
        } catch (err: any) {
          console.error('Login error:', err);
          set({ isLoading: false, error: 'Unable to connect to server. Please try again.' });
          return false;
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true, error: null });

        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone: phone || '' }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ isLoading: false, error: data.error || 'Registration failed' });
            return false;
          }

          const userData: UserProfile = {
            id: data.user?.id || '',
            email: data.user?.email || email,
            name: data.user?.name || name,
            phone: data.user?.phone || phone,
            avatarUrl:
              data.user?.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
            addresses: [],
            createdAt: data.user?.createdAt,
          };

          const token = data.tokens?.accessToken || '';
          localStorage.setItem('bkd_access_token', token);

          set({
            user: userData,
            accessToken: token,
            refreshToken: data.tokens?.refreshToken || '',
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          console.error('Register error:', err);
          set({ isLoading: false, error: 'Unable to connect to server. Please try again.' });
          return false;
        }
      },

      fetchProfile: async () => {
        const token = get().accessToken || localStorage.getItem('bkd_access_token');
        if (!token) return;

        try {
          const res = await fetch(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              set((state) => ({
                user: {
                  ...state.user,
                  ...data.user,
                  avatarUrl:
                    data.user.avatarUrl ||
                    state.user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.email}`,
                  addresses: data.user.addresses || [],
                },
              }));
            }
          }
        } catch (err) {
          console.warn('Failed to fetch user profile:', err);
        }
      },

      updateUserProfile: async (name, phone) => {
        const token = get().accessToken || localStorage.getItem('bkd_access_token');
        if (!token) return false;

        try {
          const res = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, phone }),
          });

          if (res.ok) {
            set((state) => ({
              user: state.user ? { ...state.user, name, phone } : null,
            }));
            return true;
          }
          return false;
        } catch (err) {
          console.error('Update profile error:', err);
          return false;
        }
      },

      addAddress: async (addr) => {
        const token = get().accessToken || localStorage.getItem('bkd_access_token');
        if (!token) return false;

        try {
          const res = await fetch(`${API_BASE}/auth/addresses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addr),
          });

          if (res.ok) {
            await get().fetchProfile();
            return true;
          }
          return false;
        } catch (err) {
          console.error('Add address error:', err);
          return false;
        }
      },

      deleteAddress: async (id) => {
        const token = get().accessToken || localStorage.getItem('bkd_access_token');
        if (!token) return false;

        try {
          const res = await fetch(`${API_BASE}/auth/addresses/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    addresses: (state.user.addresses || []).filter((a) => a.id !== id),
                  }
                : null,
            }));
            return true;
          }
          return false;
        } catch (err) {
          console.error('Delete address error:', err);
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('bkd_access_token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bkd_auth_store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
