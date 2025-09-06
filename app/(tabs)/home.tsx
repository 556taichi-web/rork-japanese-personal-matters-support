import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity, 
  TrendingUp, 
  Target,
  Plus,
  Award,
  Clock,
  Zap
} from 'lucide-react-native';

import { useAuth } from '@/lib/auth';
import { trpc } from '@/lib/trpc';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Fetch user profile
  const profileQuery = trpc.profile.get.useQuery();
  
  // Fetch recent workouts for stats
  const workoutsQuery = trpc.workouts.list.useQuery({});
  
  // Fetch today's nutrition logs
  const todayNutritionQuery = trpc.nutrition.logs.useQuery({
    date: new Date().toISOString().split('T')[0],
  });

  const stats: StatCard[] = useMemo(() => {
    const todayCalories = todayNutritionQuery.data?.reduce((sum: number, log: any) => sum + (log.calories || 0), 0) || 0;
    const weeklyWorkouts = workoutsQuery.data?.length || 0;
    const currentWeight = (profileQuery.data as any)?.weight_kg || 0;
    
    return [
      {
        id: 'weight',
        title: '体重',
        value: currentWeight > 0 ? `${currentWeight}kg` : '未設定',
        change: '-0.5kg', // TODO: Calculate from historical data
        icon: <TrendingUp size={20} color="white" />,
        color: '#10B981',
      },
      {
        id: 'workouts',
        title: '今週の運動',
        value: `${weeklyWorkouts}回`,
        change: '+1回', // TODO: Calculate from previous week
        icon: <Activity size={20} color="white" />,
        color: '#3B82F6',
      },
      {
        id: 'calories',
        title: '今日のカロリー',
        value: `${todayCalories}kcal`,
        change: '-200kcal', // TODO: Calculate from target
        icon: <Zap size={20} color="white" />,
        color: '#F59E0B',
      },
      {
        id: 'streak',
        title: '継続日数',
        value: '12日', // TODO: Calculate streak
        change: '+1日',
        icon: <Award size={20} color="white" />,
        color: '#EF4444',
      },
    ];
  }, [profileQuery.data, workoutsQuery.data, todayNutritionQuery.data]);

  const quickActions: QuickAction[] = [
    {
      id: 'workout',
      title: '運動を記録',
      subtitle: 'トレーニングを追加',
      icon: <Activity size={24} color="#FF6B9D" />,
      color: '#FFF1F5',
      onPress: () => router.push('/workout/add'),
    },
    {
      id: 'meal',
      title: '食事を記録',
      subtitle: '今日の食事を追加',
      icon: <Plus size={24} color="#10B981" />,
      color: '#F0FDF4',
      onPress: () => router.push('/meal/add'),
    },
    {
      id: 'history',
      title: '履歴を確認',
      subtitle: 'ワークアウト履歴を見る',
      icon: <Target size={24} color="#3B82F6" />,
      color: '#EFF6FF',
      onPress: () => router.push('/workout/history'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8A80']}
        style={[styles.header, { paddingTop: styles.header.paddingVertical + insets.top }]}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>おはようございます</Text>
          <Text style={styles.userName}>
            {(profileQuery.data as any)?.full_name || user?.email?.split('@')?.[0] || 'ユーザー'}さん
          </Text>
        </View>
        <Text style={styles.motivationText}>今日も一緒に頑張りましょう！</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {(profileQuery.isLoading || workoutsQuery.isLoading || todayNutritionQuery.isLoading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B9D" />
            <Text style={styles.loadingText}>データを読み込み中...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>今日の状況</Text>
              <View style={styles.statsGrid}>
                {stats.map((stat) => (
                  <View key={stat.id} style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                      {stat.icon}
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                    <Text style={[styles.statChange, { color: stat.color }]}>
                      {stat.change}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>クイックアクション</Text>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    {action.icon}
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>今日のアドバイス</Text>
              <View style={styles.adviceCard}>
                <View style={styles.adviceIcon}>
                  <Clock size={24} color="#FF6B9D" />
                </View>
                <View style={styles.adviceContent}>
                  <Text style={styles.adviceTitle}>水分補給を忘れずに</Text>
                  <Text style={styles.adviceText}>
                    1日2リットルの水分摂取を目標にしましょう。運動前後は特に重要です。
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
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
  greeting: {
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  motivationText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  adviceCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adviceIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF1F5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});