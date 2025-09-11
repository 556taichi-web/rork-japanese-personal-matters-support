import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { checkBackendHealth, quickHealthCheck } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw, AlertCircle } from 'lucide-react-native';

export default function IndexPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const insets = useSafeAreaInsets();

  const checkConnection = async (useQuickCheck: boolean = false) => {
    console.log('Checking backend connection...');
    setBackendStatus('checking');
    
    try {
      const isHealthy = useQuickCheck 
        ? await quickHealthCheck()
        : await checkBackendHealth();
      
      setBackendStatus(isHealthy ? 'connected' : 'disconnected');
      
      if (isHealthy) {
        console.log('Backend connection successful');
        setConnectionAttempts(0);
        setShowOfflineMode(false);
      } else {
        console.log('Backend connection failed');
        setConnectionAttempts(prev => prev + 1);
        
        // Show offline mode after 3 failed attempts
        if (connectionAttempts >= 2) {
          setShowOfflineMode(true);
        }
      }
    } catch (error) {
      console.error('Backend health check error:', error);
      setBackendStatus('disconnected');
      setConnectionAttempts(prev => prev + 1);
      
      if (connectionAttempts >= 2) {
        setShowOfflineMode(true);
      }
    }
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    setShowOfflineMode(false);
    await checkConnection(false); // Use full health check on retry
    setIsRetrying(false);
  };
  
  const continueOffline = () => {
    // Allow user to continue without backend connection
    if (user) {
      return <Redirect href="/(tabs)/home" />;
    }
    return <Redirect href="/auth/login" />;
  };

  const showConnectionHelp = () => {
    Alert.alert(
      'バックエンドサーバー接続について',
      '接続できない場合は以下を確認してください:\n\n' +
      '1. バックエンドサーバーが起動していることを確認\n' +
      '2. ターミナルで "bun run dev" を実行\n' +
      '3. http://localhost:3001 でサーバーが動作していることを確認\n' +
      '4. ファイアウォールやセキュリティソフトがブロックしていないか確認\n' +
      '5. ネットワーク接続を確認\n\n' +
      'それでも接続できない場合は、オフラインモードで続行できます。',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    // Start with quick check for faster feedback
    const performInitialCheck = async () => {
      await checkConnection(true);
    };
    performInitialCheck();
  }, []);

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

  // Show backend connection status
  if (backendStatus === 'checking') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>バックエンドサーバーに接続中...</Text>
        </View>
      </View>
    );
  }

  if (backendStatus === 'disconnected') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#FF3B30" style={styles.errorIcon} />
          <Text style={styles.errorTitle}>バックエンドサーバーと接続できません</Text>
          <Text style={styles.errorMessage}>
            サーバーが起動していない可能性があります。{"\n"}
            ターミナルで &quot;bun run dev&quot; を実行してください。
            {connectionAttempts > 0 && `\n\n接続試行回数: ${connectionAttempts}`}
          </Text>
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={retryConnection}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <RefreshCw size={20} color="white" />
            )}
            <Text style={styles.retryButtonText}>
              {isRetrying ? '再接続中...' : '再試行'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpButton} onPress={showConnectionHelp}>
            <Text style={styles.helpButtonText}>接続ヘルプ</Text>
          </TouchableOpacity>
          
          {showOfflineMode && (
            <TouchableOpacity style={styles.offlineButton} onPress={continueOffline}>
              <Text style={styles.offlineButtonText}>オフラインで続行</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Backend is connected, show success briefly then redirect
  if (backendStatus === 'connected') {
    // If user is authenticated, redirect to tabs
    if (user) {
      return <Redirect href="/(tabs)/home" />;
    }
    
    // If not authenticated, redirect to login
    return <Redirect href="/auth/login" />;
  }

  return null;
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  helpButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  offlineButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  offlineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});