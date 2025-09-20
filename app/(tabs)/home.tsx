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
  ChevronRight,
  Footprints,
  Scale
} from 'lucide-react-native';

import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/hooks/useProfile';
import { useWorkouts } from '@/lib/hooks/useWorkouts';
import { useNutritionLogs } from '@/lib/hooks/useNutrition';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { MacroCircle } from '@/components/MacroCircle';
import { ProgressBar } from '@/components/ProgressBar';

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
  const profileQuery = useProfile();
  
  // Fetch recent workouts for stats
  const workoutsQuery = useWorkouts();
  
  // Fetch today's nutrition logs
  const todayNutritionQuery = useNutritionLogs({
    date: new Date().toISOString().split('T')[0],
  });
  
  // Fetch recent nutrition logs (last 7 days)
  const recentNutritionQuery = useNutritionLogs({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    limit: 5,
  });
  
  // Fetch recent workouts (last 5)
  const recentWorkoutsQuery = useWorkouts({ limit: 5 });
  
  // Calculate nutrition data
  const nutritionData = useMemo(() => {
    const todayLogs = todayNutritionQuery.data || [];
    const totalCalories = todayLogs.reduce((sum: number, log: any) => sum + (log.calories || 0), 0);
    const totalCarbs = todayLogs.reduce((sum: number, log: any) => sum + (log.carbs_g || 0), 0);
    const totalProtein = todayLogs.reduce((sum: number, log: any) => sum + (log.protein_g || 0), 0);
    const totalFat = todayLogs.reduce((sum: number, log: any) => sum + (log.fat_g || 0), 0);
    
    return {
      calories: { current: totalCalories, target: 2000 },
      carbs: { current: Math.round(totalCarbs), target: 250 },
      protein: { current: Math.round(totalProtein), target: 150 },
      fat: { current: Math.round(totalFat), target: 67 },
    };
  }, [todayNutritionQuery.data]);
  
  // Calculate activity data
  const activityData = useMemo(() => {
    const todayWorkouts = workoutsQuery.data?.filter((workout: any) => {
      const workoutDate = new Date(workout.date).toDateString();
      const today = new Date().toDateString();
      return workoutDate === today;
    }) || [];
    
    const totalDuration = todayWorkouts.reduce((sum: number, workout: any) => sum + (workout.duration_minutes || 0), 0);
    
    return {
      steps: { current: 1129, target: 10000 }, // Mock data - would come from health kit
      exercise: { current: totalDuration, target: 60 },
      weight: { current: (profileQuery.data as any)?.weight_kg || 70, target: 65 },
    };
  }, [workoutsQuery.data, profileQuery.data]);

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
    <LinearGradient
      colors={Colors.backgroundGradient}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Coach AI</Text>
            <Text style={styles.appSubtitle}>AI POWERED</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.todaySection}>
          <Text style={styles.todayTitle}>今日の記録</Text>
          <TouchableOpacity>
            <Text style={styles.editButton}>編集</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {(profileQuery.isLoading || workoutsQuery.isLoading || todayNutritionQuery.isLoading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>データを読み込み中...</Text>
          </View>
        ) : (
          <>
            {/* Daily Overview Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>今日の概要</Text>
              <LinearGradient
                colors={Colors.surfaceGradient}
                style={styles.overviewCard}
              >
                <View style={styles.caloriesSection}>
                  <View style={styles.caloriesHeader}>
                    <Text style={styles.caloriesLabel}>カロリー</Text>
                    <Text style={styles.caloriesRemaining}>
                      残り {Math.max(0, nutritionData.calories.target - nutritionData.calories.current)} kcal
                    </Text>
                  </View>
                  <View style={styles.caloriesProgress}>
                    <View style={styles.caloriesBar}>
                      <View 
                        style={[
                          styles.caloriesBarFill, 
                          { 
                            width: `${Math.min((nutritionData.calories.current / nutritionData.calories.target) * 100, 100)}%` 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.caloriesText}>
                      {nutritionData.calories.current} / {nutritionData.calories.target}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.macrosGrid}>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroIndicator, { backgroundColor: Colors.carbs }]} />
                    <Text style={styles.macroLabel}>炭水化物</Text>
                    <Text style={styles.macroValue}>{nutritionData.carbs.current}g</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroIndicator, { backgroundColor: Colors.protein }]} />
                    <Text style={styles.macroLabel}>タンパク質</Text>
                    <Text style={styles.macroValue}>{nutritionData.protein.current}g</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroIndicator, { backgroundColor: Colors.fat }]} />
                    <Text style={styles.macroLabel}>脂質</Text>
                    <Text style={styles.macroValue}>{nutritionData.fat.current}g</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Activity Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>活動記録</Text>
              <View style={styles.activityGrid}>
                <LinearGradient
                  colors={Colors.surfaceGradient}
                  style={styles.activityCard}
                >
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityIcon, { backgroundColor: Colors.success + '20' }]}>
                      <Footprints size={16} color={Colors.success} />
                    </View>
                    <Text style={styles.activityLabel}>歩数</Text>
                  </View>
                  <Text style={styles.activityValue}>{activityData.steps.current.toLocaleString()}</Text>
                  <Text style={styles.activityTarget}>目標: {activityData.steps.target.toLocaleString()}</Text>
                  <View style={styles.activityProgressBar}>
                    <View 
                      style={[
                        styles.activityProgressFill, 
                        { 
                          width: `${Math.min((activityData.steps.current / activityData.steps.target) * 100, 100)}%`,
                          backgroundColor: Colors.success
                        }
                      ]} 
                    />
                  </View>
                </LinearGradient>
                
                <LinearGradient
                  colors={Colors.surfaceGradient}
                  style={styles.activityCard}
                >
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityIcon, { backgroundColor: Colors.warning + '20' }]}>
                      <Activity size={16} color={Colors.warning} />
                    </View>
                    <Text style={styles.activityLabel}>運動時間</Text>
                  </View>
                  <Text style={styles.activityValue}>{activityData.exercise.current}分</Text>
                  <Text style={styles.activityTarget}>目標: {activityData.exercise.target}分</Text>
                  <View style={styles.activityProgressBar}>
                    <View 
                      style={[
                        styles.activityProgressFill, 
                        { 
                          width: `${Math.min((activityData.exercise.current / activityData.exercise.target) * 100, 100)}%`,
                          backgroundColor: Colors.warning
                        }
                      ]} 
                    />
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Weight Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>体重管理</Text>
              <LinearGradient
                colors={Colors.surfaceGradient}
                style={styles.weightCard}
              >
                <View style={styles.weightHeader}>
                  <View style={styles.weightLabelContainer}>
                    <View style={[styles.weightIconContainer, { backgroundColor: Colors.primary + '20' }]}>
                      <Scale size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.weightLabel}>現在の体重</Text>
                  </View>
                  <TouchableOpacity>
                    <Plus size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.weightContent}>
                  <Text style={styles.weightValue}>
                    <Text style={styles.currentWeight}>{activityData.weight.current}</Text>
                    <Text style={styles.weightUnit}> kg</Text>
                  </Text>
                  <Text style={styles.weightSubtitle}>前回: {activityData.weight.current - 0.5} kg</Text>
                  <Text style={styles.weightGoal}>目標: {activityData.weight.target} kg</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>クイックアクション</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  onPress={() => router.push('/meal/add')}
                >
                  <LinearGradient
                    colors={[Colors.primary + '20', Colors.primary + '10']}
                    style={styles.quickActionCard}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryLight]}
                      style={styles.quickActionIcon}
                    >
                      <Utensils size={20} color="white" />
                    </LinearGradient>
                    <Text style={styles.quickActionTitle}>食事を記録</Text>
                    <Text style={styles.quickActionSubtitle}>カロリーと栄養素を追加</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => router.push('/workout/add')}
                >
                  <LinearGradient
                    colors={[Colors.success + '20', Colors.success + '10']}
                    style={styles.quickActionCard}
                  >
                    <LinearGradient
                      colors={[Colors.success, '#22c55e']}
                      style={styles.quickActionIcon}
                    >
                      <Dumbbell size={20} color="white" />
                    </LinearGradient>
                    <Text style={styles.quickActionTitle}>運動を記録</Text>
                    <Text style={styles.quickActionSubtitle}>ワークアウトを追加</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 8,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.3,
  },
  notificationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  todaySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editButton: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  weightCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weightLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  weightContent: {
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 16,
  },
  currentWeight: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  weightUnit: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  weightSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
    color: Colors.textPrimary,
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
  // New styles for redesigned UI
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  caloriesSection: {
    marginBottom: 20,
  },
  caloriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caloriesLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  caloriesRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  caloriesProgress: {
    alignItems: 'center',
  },
  caloriesBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  caloriesBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  activityCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  activityTarget: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  activityProgressBar: {
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  activityProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  weightGoal: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});