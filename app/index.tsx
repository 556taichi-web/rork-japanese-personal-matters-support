import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndexPage() {
  const { user, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>認証状態を確認中...</Text>
        </View>
      </View>
    );
  }

  // If user is authenticated, redirect to tabs
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }
  
  // If not authenticated, redirect to login
  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});