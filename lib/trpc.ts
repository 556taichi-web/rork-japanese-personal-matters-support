import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink as clientHttpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/backend/trpc/app-router';
import { getAuthToken } from './auth';
import superjson from 'superjson';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api`;
  }
  return 'http://localhost:3001/api';
};

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    clientHttpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      async headers() {
        const token = await getAuthToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});

export const getTRPCClientOptions = () => ({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      async headers() {
        const token = await getAuthToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});

export const checkBackendHealth = async (retries: number = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${getBaseUrl()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        console.log('✅ Backend health check passed');
        return true;
      }
    } catch (error) {
      console.log(`⚠️ Backend health check attempt ${i + 1}/${retries} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  console.log('❌ Backend health check failed after all retries');
  return false;
};

export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getBaseUrl()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
};
