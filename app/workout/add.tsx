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
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Minus, 
  Save, 
  X,
  ChevronRight,
  Dumbbell,
  Search
} from 'lucide-react-native';
import { EXERCISE_CATEGORIES, getExercisesByCategory, Exercise } from '@/constants/exercises';
import { useCreateWorkout } from '@/lib/hooks/useWorkouts';
import { Colors } from '@/constants/colors';

interface WorkoutSet {
  id: string;
  reps: number;
  weight_kg: number;
  completed: boolean;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export default function AddWorkoutScreen() {
  const [workoutTitle, setWorkoutTitle] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createWorkoutMutation = useCreateWorkout();

  const addExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exercise,
      sets: [
        {
          id: Date.now().toString(),
          reps: 10,
          weight_kg: 20,
          completed: false
        }
      ]
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updated = selectedExercises.filter((_, index) => index !== exerciseIndex);
    setSelectedExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...selectedExercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      reps: lastSet?.reps || 10,
      weight_kg: lastSet?.weight_kg || 20,
      completed: false
    };
    updated[exerciseIndex].sets.push(newSet);
    setSelectedExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, index) => index !== setIndex);
    setSelectedExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight_kg', value: number) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setSelectedExercises(updated);
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex].completed = !updated[exerciseIndex].sets[setIndex].completed;
    setSelectedExercises(updated);
  };

  const saveWorkout = async () => {
    if (!workoutTitle.trim()) {
      Alert.alert('エラー', 'ワークアウト名を入力してください');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('エラー', '少なくとも1つのエクササイズを追加してください');
      return;
    }

    setIsLoading(true);

    const exercises = selectedExercises.map(workoutExercise => ({
      exercise_name: workoutExercise.exercise.name,
      sets: workoutExercise.sets.length,
      reps: Math.round(workoutExercise.sets.reduce((sum, set) => sum + set.reps, 0) / workoutExercise.sets.length),
      weight_kg: Math.round(workoutExercise.sets.reduce((sum, set) => sum + set.weight_kg, 0) / workoutExercise.sets.length),
      duration_seconds: null,
      rest_seconds: null,
      notes: workoutExercise.notes || null
    }));

    try {
      await createWorkoutMutation.mutateAsync({
        title: workoutTitle,
        date: new Date().toISOString().split('T')[0],
        workout_items: exercises
      });
      Alert.alert('成功', 'ワークアウトが保存されました', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save workout error:', error);
      Alert.alert('エラー', 'ワークアウトの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (showExerciseSelector) {
    return (
      <LinearGradient
        colors={Colors.backgroundGradient}
        style={styles.container}
      >
        <Stack.Screen 
          options={{ 
            title: 'エクササイズを選択',
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTintColor: Colors.textPrimary,
            headerRight: () => (
              <TouchableOpacity onPress={() => setShowExerciseSelector(false)}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            )
          }} 
        />
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {!selectedCategory ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>トレーニング部位を選択</Text>
              <View style={styles.categoryGrid}>
                {EXERCISE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <LinearGradient
                      colors={Colors.surfaceGradient}
                      style={styles.categoryCardGradient}
                    >
                      <View style={styles.categoryIconContainer}>
                        <Dumbbell size={24} color={Colors.primary} />
                      </View>
                      <Text style={styles.categoryName}>{category}</Text>
                      <ChevronRight size={20} color={Colors.textTertiary} />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={styles.backButtonText}>← カテゴリに戻る</Text>
              </TouchableOpacity>
              
              <Text style={styles.categoryTitle}>{selectedCategory}</Text>
              
              <View style={styles.exerciseList}>
                {getExercisesByCategory(selectedCategory).map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseCard}
                    onPress={() => addExercise(exercise)}
                  >
                    <LinearGradient
                      colors={Colors.surfaceGradient}
                      style={styles.exerciseCardGradient}
                    >
                      <View style={styles.exerciseIconContainer}>
                        <Text style={styles.exerciseIconText}>{exercise.icon}</Text>
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                        <Text style={styles.exerciseMuscles}>
                          {exercise.muscle_groups.join(', ')}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Colors.backgroundGradient}
      style={styles.container}
    >
      <Stack.Screen 
        options={{ 
          title: 'ワークアウトを追加',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: Colors.textPrimary,
          headerRight: () => (
            <TouchableOpacity 
              onPress={saveWorkout}
              disabled={isLoading}
              style={styles.saveButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Save size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ワークアウト名</Text>
          <TextInput
            style={styles.titleInput}
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
            placeholder="例: 胸筋トレーニング"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>エクササイズ</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseSelector(true)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addExerciseButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Dumbbell size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>エクササイズを追加してください</Text>
            </View>
          ) : (
            selectedExercises.map((workoutExercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseHeaderLeft}>
                    <Text style={styles.exerciseHeaderIcon}>{workoutExercise.exercise.icon}</Text>
                    <Text style={styles.exerciseHeaderName}>{workoutExercise.exercise.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeExercise(exerciseIndex)}
                    style={styles.removeExerciseButton}
                  >
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.setsHeader}>
                  <Text style={styles.setHeaderText}>セット</Text>
                  <Text style={styles.setHeaderText}>レップ</Text>
                  <Text style={styles.setHeaderText}>重量(kg)</Text>
                  <Text style={styles.setHeaderText}>完了</Text>
                </View>

                {workoutExercise.sets.map((set, setIndex) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>{setIndex + 1}</Text>
                    
                    <View style={styles.setInputContainer}>
                      <TouchableOpacity
                        onPress={() => updateSet(exerciseIndex, setIndex, 'reps', Math.max(1, set.reps - 1))}
                        style={styles.setButton}
                      >
                        <Minus size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <Text style={styles.setValue}>{set.reps}</Text>
                      <TouchableOpacity
                        onPress={() => updateSet(exerciseIndex, setIndex, 'reps', set.reps + 1)}
                        style={styles.setButton}
                      >
                        <Plus size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.setInputContainer}>
                      <TouchableOpacity
                        onPress={() => updateSet(exerciseIndex, setIndex, 'weight_kg', Math.max(0, set.weight_kg - 2.5))}
                        style={styles.setButton}
                      >
                        <Minus size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <Text style={styles.setValue}>{set.weight_kg}</Text>
                      <TouchableOpacity
                        onPress={() => updateSet(exerciseIndex, setIndex, 'weight_kg', set.weight_kg + 2.5)}
                        style={styles.setButton}
                      >
                        <Plus size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleSetCompleted(exerciseIndex, setIndex)}
                      style={[styles.completedButton, set.completed && styles.completedButtonActive]}
                    >
                      <Text style={[styles.completedButtonText, set.completed && styles.completedButtonTextActive]}>
                        ✓
                      </Text>
                    </TouchableOpacity>

                    {workoutExercise.sets.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeSet(exerciseIndex, setIndex)}
                        style={styles.removeSetButton}
                      >
                        <X size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => addSet(exerciseIndex)}
                  style={styles.addSetButton}
                >
                  <Plus size={16} color="#FF6B9D" />
                  <Text style={styles.addSetButtonText}>セットを追加</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  titleInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
    color: Colors.textPrimary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addExerciseButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  saveButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  exerciseCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 16,
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary + '20',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseIconText: {
    fontSize: 20,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  exerciseMuscles: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  exerciseContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseHeaderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  exerciseHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  removeExerciseButton: {
    padding: 4,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  setInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  setButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  completedButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  completedButtonActive: {
    backgroundColor: Colors.success,
  },
  completedButtonText: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  completedButtonTextActive: {
    color: 'white',
  },
  removeSetButton: {
    marginLeft: 8,
    padding: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addSetButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
});