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

export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export const [AuthProvider, useAuth] = createContextHook((): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Loading profile for user:', supabaseUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      console.log('Profile query result:', { profile: !!profile, error: error?.message });

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
      console.log('Initializing auth...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Session check:', { 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        error: error?.message 
      });
      
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
        console.log('Auth state changed:', { 
          event, 
          userEmail: session?.user?.email,
          hasSession: !!session 
        });
        
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
      console.log('Attempting login with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      console.log('Login response:', { 
        user: data?.user?.email, 
        session: !!data?.session,
        error: error?.message,
        errorCode: error?.status
      });

      if (error) {
        console.error('Supabase auth error details:', JSON.stringify({
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code
        }, null, 2));
        
        // Provide more specific error messages
        let errorMessage = 'ログインに失敗しました';
        const errorMsg = error.message || '';
        
        if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_grant')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません。\n\nテスト用アカウント:\nメール: test@example.com\nパスワード: password123';
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスの確認が必要です。メールをご確認ください。';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else if (errorMsg) {
          errorMessage = `ログインに失敗しました: ${errorMsg}`;
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        console.log('User logged in successfully:', data.user.email);
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
      console.log('Attempting registration with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      console.log('Registration response:', { 
        user: data?.user?.email, 
        session: !!data?.session,
        error: error?.message 
      });

      if (error) {
        console.error('Supabase registration error:', error);
        let errorMessage = '登録に失敗しました';
        if (error.message.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています。ログインしてください。';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'パスワードは6文字以上で入力してください。';
        }
        throw new Error(errorMessage);
      }

      if (data.user) {
        console.log('User registered successfully:', data.user.email);
        
        // Profile creation is now handled by the trigger
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      console.log('Logging out user...');
      
      // Clear user state first
      setUser(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error('Logout error:', error);
        // Don't throw error - user state is already cleared
        // This ensures logout always works even if signOut fails
      }
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Don't rethrow - user state is already cleared
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