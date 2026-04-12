import { create } from 'zustand';
import { UserProfile, DailySummary, Alert } from '../types';

interface AppState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  dailySummary: DailySummary | null;
  setDailySummary: (summary: DailySummary | null) => void;
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  dailySummary: null,
  setDailySummary: (summary) => set({ dailySummary: summary }),
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
