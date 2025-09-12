// tRPC is disabled - using Supabase directly
// This file is kept for compatibility but all functionality is handled by Supabase hooks

console.log('tRPC is disabled - using Supabase directly for all data operations');

// Mock health check functions that always return true since we're using Supabase
export const checkBackendHealth = async (retries: number = 3): Promise<boolean> => {
  console.log('Backend health check skipped - using Supabase directly');
  return true;
};

export const quickHealthCheck = async (): Promise<boolean> => {
  console.log('Quick health check skipped - using Supabase directly');
  return true;
};

// Export empty objects for compatibility
export const trpc = null;
export const trpcClient = null;