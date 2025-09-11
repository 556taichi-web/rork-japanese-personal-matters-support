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

// Health check function with retry logic
export const checkBackendHealth = async (retries: number = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const baseUrl = getBaseUrl();
      console.log(`Checking backend health at: ${baseUrl}/api (attempt ${attempt}/${retries})`);
      
      // Create abort controller with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`Health check timeout after 15 seconds (attempt ${attempt})`);
        controller.abort();
      }, 15000); // Increased to 15 seconds
      
      const response = await fetch(`${baseUrl}/api`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend health check successful:', data);
        return true;
      } else {
        console.error(`Backend health check failed (attempt ${attempt}):`, response.status, response.statusText);
        if (attempt === retries) return false;
      }
    } catch (error) {
      console.error(`Backend health check error (attempt ${attempt}):`, error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log(`Request timed out on attempt ${attempt}`);
      }
      
      if (attempt === retries) {
        return false;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

// Quick health check without retries for faster feedback
export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    const baseUrl = getBaseUrl();
    console.log('Quick health check at:', `${baseUrl}/api`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${baseUrl}/api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Quick health check failed:', error);
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
          const timeoutId = setTimeout(() => {
            console.log('tRPC request timeout after 20 seconds');
            controller.abort();
          }, 20000); // Increased to 20 second timeout
          
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