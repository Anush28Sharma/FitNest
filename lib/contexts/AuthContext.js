'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '@/lib/api/auth';
import { userService } from '@/lib/api/user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, loginBy = 'username') => {
    try {
      const data = await authService.login({ identifier, password, loginBy });
      setUser(data.user);
      toast.success('Logged in successfully');
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      toast.success('Account created successfully');
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await userService.updateProfile(profileData);
      setUser(data.user);
      toast.success(data.message || 'Profile updated successfully');
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refetch: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

