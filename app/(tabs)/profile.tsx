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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Edit3, Save, LogOut, Settings } from 'lucide-react-native';
import { useAuth } from '@/lib/auth';
import { trpc } from '@/lib/trpc';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
  });

  // Fetch profile data
  const profileQuery = trpc.profile.get.useQuery();
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      profileQuery.refetch();
      setIsEditing(false);
      Alert.alert('成功', 'プロフィールを更新しました');
    },
    onError: (error) => {
      Alert.alert('エラー', error.message);
    },
  });

  React.useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        full_name: profileQuery.data.full_name || '',
        age: profileQuery.data.age?.toString() || '',
        height_cm: profileQuery.data.height_cm?.toString() || '',
        weight_kg: profileQuery.data.weight_kg?.toString() || '',
      });
    }
  }, [profileQuery.data]);

  const handleSave = () => {
    updateProfileMutation.mutate({
      full_name: formData.full_name || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ログアウト', style: 'destructive', onPress: logout },
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8A80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <User size={32} color="white" />
          </View>
          <Text style={styles.userName}>
            {profileQuery.data?.full_name || user?.email?.split('@')[0] || 'ユーザー'}
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
                  {profileQuery.data?.full_name || '未設定'}
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
                  {profileQuery.data?.age ? `${profileQuery.data.age}歳` : '未設定'}
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
                  {profileQuery.data?.height_cm ? `${profileQuery.data.height_cm}cm` : '未設定'}
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
                  {profileQuery.data?.weight_kg ? `${profileQuery.data.weight_kg}kg` : '未設定'}
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
          <Text style={styles.sectionTitle}>設定</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.settingText}>アプリ設定</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
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
    color: '#6B7280',
  },
});