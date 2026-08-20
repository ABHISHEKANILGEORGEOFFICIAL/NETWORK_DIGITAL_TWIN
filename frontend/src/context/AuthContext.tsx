import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nettwin_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        // Automatically provide default admin session for seamless local exploration
        try {
          const res = await api.login('admin@nettwin.io', 'admin123');
          localStorage.setItem('nettwin_token', res.access_token);
          setToken(res.access_token);
          setUser(res.user);
        } catch {
          // Fallback if backend offline
          setUser({
            id: 'usr-admin-01',
            email: 'admin@nettwin.io',
            full_name: 'Abhishek Anil George (Lead Architect)',
            role: 'admin',
            is_active: true,
          });
        }
        setLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        setUser(me);
      } catch (err) {
        localStorage.removeItem('nettwin_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('nettwin_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('nettwin_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchUser = async (role: UserRole) => {
    const email = `${role}@nettwin.io`;
    const password = `${role}123`;
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, logout, quickSwitchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
