import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  Flame,
  Dumbbell,
  Apple,
  ChevronRight
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analytics } from '@/lib/analytics';

interface DailyGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
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

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  React.useEffect(() => {
    analytics.screen('Home', { timestamp: new Date().toISOString() });
  }, []);
  const [dailyGoals] = useState<DailyGoal[]>([
    {
      id: '1',
      title: '歩数',
      current: 6420,
      target: 10000,
      unit: '歩',
      icon: <Activity size={24} color="#FF6B9D" />,
      color: '#FF6B9D'
    },
    {
      id: '2',
      title: 'カロリー消費',
      current: 320,
      target: 500,
      unit: 'kcal',
      icon: <Flame size={24} color="#FF9500" />,
      color: '#FF9500'
    },
    {
      id: '3',
      title: '水分摂取',
      current: 1200,
      target: 2000,
      unit: 'ml',
      icon: <Target size={24} color="#007AFF" />,
      color: '#007AFF'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'ワークアウト記録',
      subtitle: '運動を記録する',
      icon: <Dumbbell size={24} color="#FF6B9D" />,
      color: '#FF6B9D',
      onPress: () => {
        analytics.track('quick_action_pressed', { action: 'workout' });
        console.log('Workout pressed');
      }
    },
    {
      id: '2',
      title: '食事記録',
      subtitle: '食べたものを記録',
      icon: <Apple size={24} color="#34C759" />,
      color: '#34C759',
      onPress: () => {
        analytics.track('quick_action_pressed', { action: 'meal' });
        console.log('Meal pressed');
      }
    },
    {
      id: '3',
      title: '体重記録',
      subtitle: '体重・体脂肪を記録',
      icon: <TrendingUp size={24} color="#5856D6" />,
      color: '#5856D6',
      onPress: () => {
        analytics.track('quick_action_pressed', { action: 'weight' });
        console.log('Weight pressed');
      }
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8A80']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>おはよう！</Text>
        <Text style={styles.headerSubtitle}>
          今日も健康的な一日を始めましょう
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の目標</Text>
          {dailyGoals.map((goal) => {
            const progress = getProgressPercentage(goal.current, goal.target);
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalIcon}>
                    {goal.icon}
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalProgress}>
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                    </Text>
                  </View>
                  <Text style={styles.goalPercentage}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${progress}%`, backgroundColor: goal.color }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックアクション</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  {action.icon}
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                <ChevronRight size={16} color="#9CA3AF" style={styles.actionChevron} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今週の概要</Text>
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>5</Text>
                  <Text style={styles.summaryLabel}>ワークアウト</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>2.1kg</Text>
                  <Text style={styles.summaryLabel}>減量</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>85%</Text>
                  <Text style={styles.summaryLabel}>目標達成率</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalPercentage: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FF6B9D',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  actionChevron: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
});