import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initializePostHog } from "@/lib/analytics";
import { initializeSentry } from "@/lib/sentry";
import { AuthProvider } from "@/lib/auth";
import { trpc, getTRPCClientOptions } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "戻る" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [trpcClient] = React.useState(() => trpc.createClient(getTRPCClientOptions()));

  useEffect(() => {
    const initializeServices = async () => {
      try {
        initializeSentry();
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
      
      try {
        await initializePostHog();
      } catch (error) {
        console.error('Failed to initialize PostHog:', error);
      }
      
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Failed to hide splash screen:', error);
      }
    };
    
    initializeServices();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
