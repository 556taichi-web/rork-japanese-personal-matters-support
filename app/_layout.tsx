import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initializePostHog } from "@/lib/analytics";
import { initializeSentry } from "@/lib/sentry";
import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/lib/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "戻る" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeServices = async () => {
      initializeSentry();
      await initializePostHog();
      SplashScreen.hideAsync();
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
