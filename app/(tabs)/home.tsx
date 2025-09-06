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
  Zap,
  Utensils,
  Dumbbell,
  ChevronRight
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
  
  // Test backend connection first
  const connectionTest = trpc.example.hi.useQuery({ name: 'Test' });
  
  // Fetch user profile
  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: !connectionTest.isError,
  });
  
  // Fetch recent workouts for stats
  const workoutsQuery = trpc.workouts.list.useQuery({}, {
    enabled: !connectionTest.isError,
  });
  
  // Fetch today's nutrition logs
  const todayNutritionQuery = trpc.nutrition.logs.useQuery({
    date: new Date().toISOString().split('T')[0],
  }, {
    enabled: !connectionTest.isError,
  });
  
  // Fetch recent nutrition logs (last 7 days)
  const recentNutritionQuery = trpc.nutrition.logs.useQuery({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    limit: 5,
  }, {
    enabled: !connectionTest.isError,
  });
  
  // Fetch recent workouts (last 5)
  const recentWorkoutsQuery = trpc.workouts.list.useQuery({
    limit: 5,
  }, {
    enabled: !connectionTest.isError,
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
        {connectionTest.isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>バックエンドサーバーに接続できません</Text>
            <Text style={styles.errorText}>
              {connectionTest.error?.message || 'サーバーが起動していない可能性があります'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => connectionTest.refetch()}
            >
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : (profileQuery.isLoading || workoutsQuery.isLoading || todayNutritionQuery.isLoading || recentNutritionQuery.isLoading || recentWorkoutsQuery.isLoading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B9D" />
            <Text style={styles.loadingText}>データを読み込み中...</Text>
            {connectionTest.data && (
              <Text style={styles.connectionStatus}>
                バックエンド接続: {connectionTest.data.status}
              </Text>
            )}
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

            {/* Recent Workouts Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>最近のトレーニング</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/workout/history')}
                  style={styles.sectionAction}
                >
                  <Text style={styles.sectionActionText}>すべて見る</Text>
                  <ChevronRight size={16} color="#FF6B9D" />
                </TouchableOpacity>
              </View>
              {recentWorkoutsQuery.data && recentWorkoutsQuery.data.length > 0 ? (
                <View style={styles.recordsList}>
                  {recentWorkoutsQuery.data.slice(0, 3).map((workout: any, index: number) => (
                    <View key={workout.id} style={styles.recordCard}>
                      <View style={[styles.recordIcon, { backgroundColor: '#EFF6FF' }]}>
                        <Dumbbell size={20} color="#3B82F6" />
                      </View>
                      <View style={styles.recordContent}>
                        <Text style={styles.recordTitle}>{workout.body_part || 'トレーニング'}</Text>
                        <Text style={styles.recordSubtitle}>
                          {workout.workout_items?.length || 0}種目 • {new Date(workout.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.recordDetail}>
                          {workout.duration_minutes ? `${workout.duration_minutes}分` : ''}
                          {workout.notes ? ` • ${workout.notes.slice(0, 30)}${workout.notes.length > 30 ? '...' : ''}` : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Dumbbell size={32} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>まだトレーニング記録がありません</Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => router.push('/workout/add')}
                  >
                    <Text style={styles.emptyStateButtonText}>最初の記録を追加</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Recent Meals Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>最近の食事記録</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/meal/add')}
                  style={styles.sectionAction}
                >
                  <Text style={styles.sectionActionText}>記録する</Text>
                  <ChevronRight size={16} color="#FF6B9D" />
                </TouchableOpacity>
              </View>
              {recentNutritionQuery.data && recentNutritionQuery.data.length > 0 ? (
                <View style={styles.recordsList}>
                  {recentNutritionQuery.data.slice(0, 3).map((meal: any, index: number) => (
                    <View key={meal.id} style={styles.recordCard}>
                      <View style={[styles.recordIcon, { backgroundColor: '#F0FDF4' }]}>
                        <Utensils size={20} color="#10B981" />
                      </View>
                      <View style={styles.recordContent}>
                        <Text style={styles.recordTitle}>{meal.food_name || '食事記録'}</Text>
                        <Text style={styles.recordSubtitle}>
                          {meal.meal_type === 'breakfast' ? '朝食' : 
                           meal.meal_type === 'lunch' ? '昼食' : 
                           meal.meal_type === 'dinner' ? '夕食' : 'おやつ'} • 
                          {new Date(meal.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.recordDetail}>
                          {meal.calories ? `${meal.calories}kcal` : ''}
                          {meal.quantity && meal.unit ? ` • ${meal.quantity}${meal.unit}` : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Utensils size={32} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>まだ食事記録がありません</Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => router.push('/meal/add')}
                  >
                    <Text style={styles.emptyStateButtonText}>最初の記録を追加</Text>
                  </TouchableOpacity>
                </View>
              )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '500',
    marginRight: 4,
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  recordDetail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  connectionStatus: {
    marginTop: 8,
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
  },
});