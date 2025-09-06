import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "./supabase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback to localhost for development
  if (__DEV__) {
    return 'http://localhost:8081';
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
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
          const response = await fetch(url, options);
          
          // Check if response is HTML (error page)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML response instead of JSON from:', url);
            throw new Error('Server returned HTML instead of JSON. Check if the backend server is running.');
          }
          
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});