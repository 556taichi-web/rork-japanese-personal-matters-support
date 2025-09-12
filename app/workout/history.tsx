import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  Plus, 
  Calendar,
  Clock,
  Dumbbell
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkouts } from '@/lib/hooks/useWorkouts';

export default function WorkoutHistoryScreen() {
  const workoutsQuery = useWorkouts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getTotalVolume = (workout: any) => {
    if (!workout?.workout_items) return 0;
    return workout.workout_items.reduce((total: number, item: any) => {
      return total + ((item.sets || 0) * (item.reps || 0) * (item.weight_kg || 0));
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'ワークアウト履歴',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/workout/add')}
              style={styles.addButton}
            >
              <Plus size={24} color="#FF6B9D" />
            </TouchableOpacity>
          )
        }} 
      />

      <LinearGradient
        colors={['#FF6B9D', '#FF8A80']}
        style={styles.header}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutsQuery.data?.length || 0}</Text>
            <Text style={styles.statLabel}>総ワークアウト</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {workoutsQuery.data?.filter((w: any) => {
                const workoutDate = new Date(w.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return workoutDate >= weekAgo;
              }).length || 0}
            </Text>
            <Text style={styles.statLabel}>今週</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(workoutsQuery.data?.reduce((sum: number, w: any) => sum + getTotalVolume(w), 0) || 0)}
            </Text>
            <Text style={styles.statLabel}>総ボリューム</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {workoutsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B9D" />
            <Text style={styles.loadingText}>ワークアウトを読み込み中...</Text>
          </View>
        ) : workoutsQuery.data?.length === 0 ? (
          <View style={styles.emptyState}>
            <Dumbbell size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>ワークアウトがありません</Text>
            <Text style={styles.emptyStateText}>
              最初のワークアウトを記録して、進捗を追跡しましょう！
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/workout/add')}
            >
              <Plus size={20} color="white" />
              <Text style={styles.emptyStateButtonText}>ワークアウトを追加</Text>
            </TouchableOpacity>
          </View>
        ) : (
          workoutsQuery.data?.map((workout: any) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutHeaderLeft}>
                  <View style={styles.workoutIcon}>
                    <Dumbbell size={20} color="#FF6B9D" />
                  </View>
                  <View>
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                    <View style={styles.workoutMeta}>
                      <Calendar size={14} color="#6B7280" />
                      <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
                      {workout.duration_minutes && (
                        <>
                          <Clock size={14} color="#6B7280" />
                          <Text style={styles.workoutDuration}>{workout.duration_minutes}分</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.workoutStats}>
                  <Text style={styles.workoutVolume}>
                    {getTotalVolume(workout).toLocaleString()}
                  </Text>
                  <Text style={styles.workoutVolumeLabel}>総ボリューム</Text>
                </View>
              </View>

              {workout?.workout_items && workout.workout_items.length > 0 && (
                <View style={styles.exercisesList}>
                  {workout?.workout_items?.slice(0, 3).map((item: any, index: number) => (
                    <View key={index} style={styles.exerciseItem}>
                      <Text style={styles.exerciseName}>{item.exercise_name}</Text>
                      <Text style={styles.exerciseDetails}>
                        {item.sets}セット × {item.reps}レップ
                        {item.weight_kg && ` @ ${item.weight_kg}kg`}
                      </Text>
                    </View>
                  ))}
                  {workout?.workout_items?.length > 3 && (
                    <Text style={styles.moreExercises}>
                      +{workout.workout_items.length - 3}個のエクササイズ
                    </Text>
                  )}
                </View>
              )}

              {workout?.description && (
                <Text style={styles.workoutDescription}>{workout.description}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  addButton: {
    padding: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF1F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutDate: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutVolume: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  workoutVolumeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  exercisesList: {
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  moreExercises: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});