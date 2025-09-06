import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "./supabase";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // For Rork platform, use the current origin
  if (typeof window !== 'undefined' && window.location.origin.includes('rork.com')) {
    console.log('Using Rork platform origin:', window.location.origin);
    return window.location.origin;
  }

  // Use environment variable if set
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Development fallbacks
  if (__DEV__) {
    if (Platform.OS === 'web') {
      console.log('Using web development URL: http://localhost:3001');
      return 'http://localhost:3001';
    } else {
      // For mobile development, use local network IP
      console.log('Using mobile development URL: http://localhost:3001');
      return 'http://localhost:3001';
    }
  }

  throw new Error(
    "No base url found. Please ensure the backend server is running or set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const baseUrl = getBaseUrl();
    console.log('Checking backend health at:', `${baseUrl}/api`);
    
    const response = await fetch(`${baseUrl}/api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend health check successful:', data);
      return true;
    } else {
      console.error('Backend health check failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Backend health check error:', error);
    return false;
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          return {
            authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json',
          };
        } catch (error) {
          console.error('Error getting session for tRPC headers:', error);
          return {
            'Content-Type': 'application/json',
          };
        }
      },
      fetch: async (url, options) => {
        try {
          console.log('tRPC request to:', url);
          console.log('Request options:', {
            method: options?.method || 'GET',
            headers: options?.headers,
          });
          
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          console.log('tRPC response status:', response.status, response.statusText);
          
          if (!response.ok) {
            console.error('tRPC response not ok:', response.status, response.statusText);
            
            // Try to get error details
            try {
              const errorText = await response.text();
              console.error('Error response body:', errorText.substring(0, 500));
            } catch {
              console.error('Could not read error response body');
            }
          }
          
          // Check if response is HTML (error page)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML response instead of JSON from:', url);
            const text = await response.text();
            console.error('HTML response body:', text.substring(0, 500));
            throw new Error('サーバーがHTMLを返しました。バックエンドサーバーが正しく動作していない可能性があります。');
          }
          
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          
          if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('リクエストがタイムアウトしました。サーバーの応答が遅い可能性があります。');
          }
          
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            const baseUrl = getBaseUrl();
            console.error('Connection failed to:', baseUrl);
            throw new Error(`バックエンドサーバーに接続できません。サーバーが ${baseUrl} で動作していることを確認してください。`);
          }
          
          throw error;
        }
      },
    }),
  ],
});