import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/services/api';
import { User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check auth status when component mounts
    checkAuthStatus();

    // Set up storage event listener for logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthStatus = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      await authService.login({ username, password });
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return { isAuthenticated, user, login, logout, loading };
};
