import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, type Profile } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  profile?: Profile;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await loadUserProfile(session.user);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          profile: profile || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            profile: profile || undefined,
          });
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeAuth, loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const profile = await loadUserProfile(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          profile: profile || undefined,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const profile = await loadUserProfile(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          profile: profile || undefined,
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
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