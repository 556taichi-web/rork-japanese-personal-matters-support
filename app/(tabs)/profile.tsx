import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Edit3, Save, LogOut, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/hooks/useProfile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    target_weight_kg: '',
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch profile data
  const profileQuery = useProfile();
  const queryClient = useQueryClient();
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      full_name?: string;
      age?: number;
      height_cm?: number;
      weight_kg?: number;
      target_weight_kg?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: data.full_name || null,
          age: data.age || null,
          height_cm: data.height_cm || null,
          weight_kg: data.weight_kg || null,
          target_weight_kg: data.target_weight_kg || null,
        } as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      setSuccessMessage('プロフィールを更新しました');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    },
    onError: (error) => {
      Alert.alert('エラー', error.message);
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async ({ newEmail, password }: { newEmail: string; password: string }) => {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: undefined }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setShowEmailModal(false);
      setEmailData({ newEmail: '', password: '' });
      setSuccessMessage('メールアドレスを更新しました。確認メールをご確認ください。');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'メールアドレスの更新に失敗しました');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('パスワードを更新しました');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'パスワードの更新に失敗しました');
    },
  });

  React.useEffect(() => {
    if ((profileQuery as any).data) {
      const data = (profileQuery as any).data;
      setFormData({
        full_name: data.full_name || '',
        age: data.age?.toString() || '',
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || '',
        target_weight_kg: data.target_weight_kg?.toString() || '',
      });
    }
  }, [profileQuery.data]);

  const handleSave = () => {
    updateProfileMutation.mutate({
      full_name: formData.full_name || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
      target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : undefined,
    });
  };

  const handleEmailUpdate = () => {
    if (!emailData.newEmail) {
      Alert.alert('エラー', '新しいメールアドレスを入力してください');
      return;
    }
    updateEmailMutation.mutate({
      newEmail: emailData.newEmail.toLowerCase().trim(),
      password: emailData.password,
    });
  };

  const handlePasswordUpdate = () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('エラー', 'すべてのフィールドを入力してください');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }
    updatePasswordMutation.mutate({
      newPassword: passwordData.newPassword,
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Logging out...');
              await logout();
              console.log('Logout successful');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>プロフィールを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={Colors.backgroundGradient}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={Colors.surfaceGradient}
          style={styles.header}
        >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <User size={32} color="white" />
          </View>
          <Text style={styles.userName}>
            {(profileQuery.data as any)?.full_name || user?.email?.split('@')[0] || 'ユーザー'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>基本情報</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              {isEditing ? (
                <Save size={20} color="#FF6B9D" />
              ) : (
                <Edit3 size={20} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>名前</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                  placeholder="お名前を入力"
                />
              ) : (
                <Text style={styles.value}>
                  {(profileQuery.data as any)?.full_name || '未設定'}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>年齢</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  placeholder="年齢を入力"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>
                  {(profileQuery.data as any)?.age ? `${(profileQuery.data as any).age}歳` : '未設定'}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>身長</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.height_cm}
                  onChangeText={(text) => setFormData({ ...formData, height_cm: text })}
                  placeholder="身長を入力 (cm)"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>
                  {(profileQuery.data as any)?.height_cm ? `${(profileQuery.data as any).height_cm}cm` : '未設定'}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>体重</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.weight_kg}
                  onChangeText={(text) => setFormData({ ...formData, weight_kg: text })}
                  placeholder="体重を入力 (kg)"
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.value}>
                  {(profileQuery.data as any)?.weight_kg ? `${(profileQuery.data as any).weight_kg}kg` : '未設定'}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>目標体重</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.target_weight_kg}
                  onChangeText={(text) => setFormData({ ...formData, target_weight_kg: text })}
                  placeholder="目標体重を入力 (kg)"
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.value}>
                  {(profileQuery.data as any)?.target_weight_kg ? `${(profileQuery.data as any).target_weight_kg}kg` : '未設定'}
                </Text>
              )}
            </View>

            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>保存</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント設定</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setShowEmailModal(true)}
          >
            <Mail size={20} color={Colors.textSecondary} />
            <Text style={styles.settingText}>メールアドレスを変更</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { marginTop: 12 }]} 
            onPress={() => setShowPasswordModal(true)}
          >
            <Lock size={20} color={Colors.textSecondary} />
            <Text style={styles.settingText}>パスワードを変更</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          </View>
        </Modal>

        {/* Email Update Modal */}
        <Modal
          visible={showEmailModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>メールアドレスを変更</Text>
              <Text style={styles.modalSubtitle}>現在: {user?.email}</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="新しいメールアドレス"
                placeholderTextColor={Colors.textSecondary}
                value={emailData.newEmail}
                onChangeText={(text) => setEmailData({ ...emailData, newEmail: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowEmailModal(false);
                    setEmailData({ newEmail: '', password: '' });
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleEmailUpdate}
                  disabled={updateEmailMutation.isPending}
                >
                  {updateEmailMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>更新</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Password Update Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>パスワードを変更</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="新しいパスワード"
                placeholderTextColor={Colors.textSecondary}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                secureTextEntry
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="パスワードを確認"
                placeholderTextColor={Colors.textSecondary}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                secureTextEntry
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handlePasswordUpdate}
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>更新</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glass,
    borderWidth: 2,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.glass,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  value: {
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  settingText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.error + '40',
    backgroundColor: Colors.error + '10',
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalButtonConfirm: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});