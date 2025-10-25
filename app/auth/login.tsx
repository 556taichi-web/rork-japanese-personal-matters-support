import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, AlertCircle, X } from 'lucide-react-native';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const { login } = useAuth();
  const router = useRouter();

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideError = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setErrorVisible(false);
      setErrorMessage('');
    });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting login process...');
      await login(email.trim(), password);
      console.log('Login successful, navigating to home...');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Login error in component:', error);
      let message = 'ログインに失敗しました';
      
      if (error instanceof Error) {
        const errorMsg = error.message;
        if (errorMsg.includes('メールアドレスまたはパスワードが正しくありません')) {
          message = 'メールアドレスまたはパスワードが正しくありません';
        } else if (errorMsg.includes('Invalid login credentials')) {
          message = 'メールアドレスまたはパスワードが正しくありません';
        } else if (errorMsg.includes('Invalid API key')) {
          message = 'システムエラーが発生しました。管理者にお問い合わせください。';
        } else if (errorMsg.includes('ネットワークエラー')) {
          message = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else {
          message = errorMsg;
        }
      }
      
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Modal
              visible={errorVisible}
              transparent
              animationType="none"
              onRequestClose={hideError}
            >
              <View style={styles.modalOverlay}>
                <Animated.View style={[styles.errorPopup, { opacity: fadeAnim }]}>
                  <View style={styles.errorHeader}>
                    <View style={styles.errorIconContainer}>
                      <AlertCircle size={24} color="#EF4444" />
                    </View>
                    <TouchableOpacity onPress={hideError} style={styles.closeButton}>
                      <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.errorTitle}>ログインエラー</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <TouchableOpacity
                    style={styles.errorButton}
                    onPress={hideError}
                  >
                    <Text style={styles.errorButtonText}>閉じる</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Modal>
            <View style={styles.header}>
              <Text style={styles.title}>AIパーソナル</Text>
              <Text style={styles.subtitle}>あなた専用のフィットネスコーチ</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="メールアドレス"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="email-input"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="パスワード"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  testID="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                testID="login-button"
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testButton}
                onPress={() => {
                  setEmail('test@example.com');
                  setPassword('password123');
                }}
                testID="fill-test-credentials"
              >
                <Text style={styles.testButtonText}>テスト用アカウントを入力</Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>アカウントをお持ちでない方は</Text>
                <TouchableOpacity onPress={navigateToRegister} testID="register-link">
                  <Text style={styles.registerLink}>新規登録</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(42, 42, 74, 0.6)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  registerLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorPopup: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});