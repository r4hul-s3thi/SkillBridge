import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';
import { useAppStore } from './appStore';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        // Clear previous user's data before setting new auth
        useAppStore.setState({ skills: [], matches: [], conversations: [], sessions: [], ratings: [] });
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        useAppStore.setState({ skills: [], matches: [], conversations: [], sessions: [], ratings: [] });
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'skillswap-auth' }
  )
);
