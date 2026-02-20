import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

import { ACCESS_TOKEN } from '#/constants';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '#/utils/localStorage';

interface AuthContextType {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const localStorageToken = getLocalStorageItem(ACCESS_TOKEN) as string | null;
  const [token, setToken] = useState<string | null>(localStorageToken);

  const login = (newToken: string) => {
    setToken(newToken);
    setLocalStorageItem(ACCESS_TOKEN, newToken);
  };

  const logout = () => {
    setToken(null);
    removeLocalStorageItem(ACCESS_TOKEN);
  };

  useEffect(() => {
    if (localStorageToken !== token) setToken(localStorageToken);
  }, [localStorageToken]);

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
