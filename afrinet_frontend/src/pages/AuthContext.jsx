import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  const navigate = useNavigate();

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const initializeAuth = async () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      if (isTokenValid(token)) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken && isTokenValid(refreshToken)) {
          const response = await axiosInstance.post('/api/auth/token/refresh/', {
            refresh: refreshToken
          });

          localStorage.setItem('access_token', response.data.access);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          setLastRefresh(Date.now());
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    await logout();
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login/', { email, password });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLastRefresh(Date.now());

      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await axiosInstance.post('/api/auth/register/', {
        name,
        email,
        password,
        confirmPassword: password, // Send password confirmation
        phone
      });

      // Update to match backend response structure
      const userData = {
        email: response.data.user.email,
        name: response.data.user.name,
        phone: response.data.user.phone,
        is_staff: response.data.user.is_staff
      };

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      setUser(userData);
      setIsAuthenticated(true);
      setLastRefresh(Date.now());
      
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await axiosInstance.post('/api/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    initializeAuth();

    const interval = setInterval(() => {
      const token = localStorage.getItem('access_token');
      if (token && !isTokenValid(token)) {
        initializeAuth();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      lastRefresh,
      login,
      register,
      logout
    }}>
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