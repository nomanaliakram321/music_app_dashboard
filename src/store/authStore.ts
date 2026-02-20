import { create } from 'zustand';

import { ACCESS_TOKEN } from '#/constants';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '#/utils/localStorage';

interface AuthState {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  token: getLocalStorageItem<string>(ACCESS_TOKEN) || null,

  login: (newToken: string) => {
    setLocalStorageItem(ACCESS_TOKEN, newToken);
    set({ token: newToken });
  },

  logout: () => {
    removeLocalStorageItem(ACCESS_TOKEN);
    set({ token: null });
  },
}));

export const useToken = () => useAuthStore(state => state.token);
export const useAuthLogin = () => useAuthStore(state => state.login);
export const useAuthLogout = () => useAuthStore(state => state.logout);
