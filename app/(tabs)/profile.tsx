import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Award,
  Target,
  Calendar,
  TrendingUp,
  Heart
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const settingsItems: SettingItem[] = [
    {
      id: 'goals',
      title: '目標設定',
      subtitle: '体重・運動目標を設定',
      icon: <Target size={24} color="#FF6B9D" />,
      onPress: () => console.log('Goals pressed'),
    },
    {
      id: 'progress',
      title: '進捗レポート',
      subtitle: '詳細な分析結果を確認',
      icon: <TrendingUp size={24} color="#FF6B9D" />,
      onPress: () => console.log('Progress pressed'),
    },
    {
      id: 'health',
      title: '健康データ',
      subtitle: '体重・体脂肪率の履歴',
      icon: <Heart size={24} color="#FF6B9D" />,
      onPress: () => console.log('Health pressed'),
    },
    {
      id: 'notifications',
      title: '通知設定',
      subtitle: 'リマインダーを管理',
      icon: <Bell size={24} color="#FF6B9D" />,
      onPress: () => console.log('Notifications pressed'),
    },
    {
      id: 'appearance',
      title: '表示設定',
      subtitle: 'テーマ・言語設定',
      icon: <Moon size={24} color="#FF6B9D" />,
      onPress: () => console.log('Appearance pressed'),
    },
    {
      id: 'help',
      title: 'ヘルプ・サポート',
      subtitle: 'よくある質問・お問い合わせ',
      icon: <HelpCircle size={24} color="#FF6B9D" />,
      onPress: () => console.log('Help pressed'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8A80']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.avatar}
            >
              <User size={32} color="white" />
            </LinearGradient>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'ユーザー'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>52kg</Text>
            <Text style={styles.statLabel}>現在の体重</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>-2.1kg</Text>
            <Text style={styles.statLabel}>今月の変化</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>目標達成率</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>設定</Text>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>
                {item.icon}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          <TouchableOpacity
            style={[styles.settingItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <LogOut size={24} color="#EF4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.logoutText]}>ログアウト</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoutItem: {
    borderColor: '#FEE2E2',
    borderWidth: 1,
  },
  logoutText: {
    color: '#EF4444',
  },
});