import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'auth_user';

export const [AuthProvider, useAuth] = createContextHook((): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, simulate login with mock data
      if (email && password) {
        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
        };
        
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw new Error('メールアドレスとパスワードを入力してください');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, simulate registration with mock data
      if (email && password) {
        const mockUser: User = {
          id: '1',
          email,
          name: name || email.split('@')[0],
        };
        
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw new Error('メールアドレスとパスワードを入力してください');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
  }), [user, isLoading, login, register, logout]);
});