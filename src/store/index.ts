import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Company } from '@/types';

interface AuthState {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setCompany: (company) => set({ company }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, company: null }),
    }),
    {
      name: 'rkz-auth',
      partialize: (state) => ({ user: state.user, company: state.company }),
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'rkz-ui',
    }
  )
);

interface AlertsState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useAlertsStore = create<AlertsState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
