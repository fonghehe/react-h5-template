'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Locale, User } from '@rh5/contracts';

interface SessionState {
  locale: Locale;
  token: string;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLocale: (locale: Locale) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      locale: 'zh-CN',
      token: '',
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: '', user: null }),
      setLocale: (locale) => {
        document.documentElement.lang = locale;
        set({ locale });
      },
    }),
    { name: 'react-h5-session', skipHydration: true },
  ),
);
