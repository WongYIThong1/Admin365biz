import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyToken, logoutApi, refreshToken } from '../lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  admin: any;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('Backend logout failed, clearing local state anyway');
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const storedAdmin = localStorage.getItem('admin');

    // 1. If no access token, try silent refresh (it uses cookies)
    if (!token) {
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.ok) {
          localStorage.setItem('accessToken', refreshResult.data.accessToken);
          localStorage.setItem('admin', JSON.stringify(refreshResult.data.admin));
          setAdmin(refreshResult.data.admin);
          return true;
        }
      } catch (e) {
        console.warn('Initial silent refresh failed');
      }
      setAdmin(null);
      return false;
    }

    // 2. Already have a token, verify it
    try {
      const result = await verifyToken(token);
      if (result.ok) {
        setAdmin(storedAdmin ? JSON.parse(storedAdmin) : true);
        return true;
      } else {
        // 3. Access token expired, attempt to refresh
        console.log('Access token invalid, attempting refresh...');
        const refreshResult = await refreshToken();
        
        if (refreshResult.ok) {
          localStorage.setItem('accessToken', refreshResult.data.accessToken);
          localStorage.setItem('admin', JSON.stringify(refreshResult.data.admin));
          setAdmin(refreshResult.data.admin);
          return true;
        }
        
        // 4. Everything failed, force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('admin');
        setAdmin(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const isAuthenticated = await checkAuth();
      const isLoginPage = location.pathname === '/login';

      if (!isAuthenticated && !isLoginPage) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (isAuthenticated && isLoginPage) {
        navigate('/dashboard');
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ admin, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
