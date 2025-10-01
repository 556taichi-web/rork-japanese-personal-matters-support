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
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Save, 
  X,
  ChevronRight,
  Dumbbell
} from 'lucide-react-native';
import { EXERCISE_CATEGORIES, getExercisesByCategory, Exercise, getExerciseDisplayName } from '@/constants/exercises';
import { useCreateWorkout } from '@/lib/hooks/useWorkouts';
import { Colors } from '@/constants/colors';

interface WorkoutSet {
  id: string;
  reps: number;
  weight_kg: number;
  duration_minutes?: number;
  completed: boolean;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export default function AddWorkoutScreen() {
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createWorkoutMutation = useCreateWorkout();
  
  console.log('AddWorkoutScreen render - createWorkoutMutation:', {
    isPending: createWorkoutMutation.isPending,
    isError: createWorkoutMutation.isError,
    error: createWorkoutMutation.error,
    mutateAsync: typeof createWorkoutMutation.mutateAsync
  });

  const addExercise = (exercise: Exercise) => {
    const isCardio = exercise.category === '有酸素';
    const newExercise: WorkoutExercise = {
      exercise,
      sets: [
        {
          id: Date.now().toString(),
          reps: isCardio ? 1 : 10,
          weight_kg: isCardio ? 0 : 20,
          duration_minutes: isCardio ? 30 : undefined,
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
    const isCardio = updated[exerciseIndex].exercise.category === '有酸素';
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      reps: lastSet?.reps || (isCardio ? 1 : 10),
      weight_kg: lastSet?.weight_kg || (isCardio ? 0 : 20),
      duration_minutes: isCardio ? (lastSet?.duration_minutes || 30) : undefined,
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

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight_kg' | 'duration_minutes', value: number) => {
    const updated = [...selectedExercises];
    if (field === 'duration_minutes') {
      updated[exerciseIndex].sets[setIndex].duration_minutes = value;
    } else {
      updated[exerciseIndex].sets[setIndex][field] = value;
    }
    setSelectedExercises(updated);
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex].completed = !updated[exerciseIndex].sets[setIndex].completed;
    setSelectedExercises(updated);
  };

  const saveWorkout = async () => {
    console.log('=== SAVE WORKOUT START ===');
    console.log('Button pressed - saveWorkout function called');
    
    if (selectedExercises.length === 0) {
      console.log('Validation failed: No exercises selected');
      Alert.alert('エラー', '少なくとも1つのエクササイズを追加してください');
      return;
    }

    // Generate workout title from exercise categories
    const categories = [...new Set(selectedExercises.map(ex => ex.exercise.category))];
    const workoutTitle = categories.length === 1 
      ? `${categories[0]}トレーニング`
      : `複合トレーニング`;

    console.log('Validation passed. Selected exercises:', selectedExercises.length);
    console.log('Generated workout title:', workoutTitle);
    console.log('createWorkoutMutation object:', createWorkoutMutation);
    console.log('createWorkoutMutation.mutateAsync type:', typeof createWorkoutMutation.mutateAsync);
    
    setIsLoading(true);
    console.log('Loading state set to true');

    try {
      console.log('=== PROCESSING EXERCISES ===');
      const workout_items = selectedExercises.map((workoutExercise, index) => {
        console.log(`Processing exercise ${index + 1}:`, workoutExercise.exercise.name);
        
        const isCardio = workoutExercise.exercise.category === '有酸素';
        const totalDuration = workoutExercise.sets.reduce((sum, set) => sum + (set.duration_minutes || 0), 0);
        const avgReps = workoutExercise.sets.length > 0 
          ? Math.round(workoutExercise.sets.reduce((sum, set) => sum + set.reps, 0) / workoutExercise.sets.length)
          : 0;
        const avgWeight = workoutExercise.sets.length > 0 
          ? workoutExercise.sets.reduce((sum, set) => sum + set.weight_kg, 0) / workoutExercise.sets.length
          : 0;
        
        const exerciseName = getExerciseDisplayName(workoutExercise.exercise);
        console.log(`Exercise name for DB: "${exerciseName}"`);
        
        const item = {
          exercise_name: exerciseName,
          sets: workoutExercise.sets.length,
          reps: avgReps,
          weight_kg: isCardio ? null : avgWeight,
          duration_seconds: isCardio ? totalDuration * 60 : null,
          rest_seconds: null,
          notes: workoutExercise.notes || null
        };
        
        console.log(`Workout item ${index + 1}:`, JSON.stringify(item, null, 2));
        return item;
      });

      const workoutData = {
        title: workoutTitle,
        date: new Date().toISOString().split('T')[0],
        workout_items
      };
      
      console.log('=== SENDING TO BACKEND ===');
      console.log('Final workout data:', JSON.stringify(workoutData, null, 2));
      console.log('About to call createWorkoutMutation.mutateAsync...');

      const result = await createWorkoutMutation.mutateAsync(workoutData);
      console.log('mutateAsync completed successfully');
      
      console.log('=== BACKEND RESPONSE ===');
      console.log('Workout saved successfully:', JSON.stringify(result, null, 2));
      
      console.log('Workout saved successfully, navigating to home...');
      
      // Show success message before navigation
      Alert.alert(
        '成功',
        'ワークアウトが保存されました！',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Success alert dismissed, navigating to home');
              router.replace('/(tabs)/home');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('=== SAVE WORKOUT ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error details:', error);
      console.error('Error constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'ワークアウトの保存に失敗しました。もう一度お試しください。';
      console.error('Showing error to user:', errorMessage);
      Alert.alert('エラー', errorMessage);
    } finally {
      console.log('=== SAVE WORKOUT END - Setting loading to false ===');
      setIsLoading(false);
      console.log('Loading state set to false');
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
              <Text style={styles.sectionTitle}>トレーニング種類を選択</Text>
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
          headerRight: () => null
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>


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
              <View key={`exercise-${exerciseIndex}-${workoutExercise.exercise.id}`} style={styles.exerciseContainer}>
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
                  {workoutExercise.exercise.category === '有酸素' ? (
                    <>
                      <Text style={styles.setHeaderText}>時間(分)</Text>
                      <Text style={styles.setHeaderText}>強度</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.setHeaderText}>レップ</Text>
                      <Text style={styles.setHeaderText}>重量(kg)</Text>
                    </>
                  )}
                </View>

                {workoutExercise.sets.map((set, setIndex) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>{setIndex + 1}</Text>
                    
                    {workoutExercise.exercise.category === '有酸素' ? (
                      <>
                        <View style={styles.setInputContainer}>
                          <TextInput
                            style={styles.setInput}
                            value={(set.duration_minutes || 0).toString()}
                            onChangeText={(text) => {
                              const value = parseInt(text) || 0;
                              updateSet(exerciseIndex, setIndex, 'duration_minutes', Math.max(0, value));
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={Colors.textTertiary}
                          />
                        </View>
                        <View style={styles.setInputContainer}>
                          <TextInput
                            style={styles.setInput}
                            value={set.reps.toString()}
                            onChangeText={(text) => {
                              const value = parseInt(text) || 0;
                              updateSet(exerciseIndex, setIndex, 'reps', Math.max(1, Math.min(10, value)));
                            }}
                            keyboardType="numeric"
                            placeholder="5"
                            placeholderTextColor={Colors.textTertiary}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.setInputContainer}>
                          <TextInput
                            style={styles.setInput}
                            value={set.reps.toString()}
                            onChangeText={(text) => {
                              const value = parseInt(text) || 0;
                              updateSet(exerciseIndex, setIndex, 'reps', Math.max(0, value));
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={Colors.textTertiary}
                          />
                        </View>
                        <View style={styles.setInputContainer}>
                          <TextInput
                            style={styles.setInput}
                            value={set.weight_kg.toString()}
                            onChangeText={(text) => {
                              const value = parseFloat(text) || 0;
                              updateSet(exerciseIndex, setIndex, 'weight_kg', Math.max(0, value));
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={Colors.textTertiary}
                          />
                        </View>
                      </>
                    )}



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
      
      {/* Bottom Save Button */}
      {!showExerciseSelector && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            onPress={() => {
              console.log('BUTTON PRESSED - TouchableOpacity onPress triggered');
              console.log('Current isLoading state:', isLoading);
              if (!isLoading) {
                saveWorkout();
              } else {
                console.log('Button press ignored - already loading');
              }
            }}
            disabled={isLoading}
            style={[styles.bottomSaveButton, isLoading && { opacity: 0.6 }]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={styles.bottomSaveButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Save size={20} color="white" />
                  <Text style={styles.bottomSaveButtonText}>ワークアウトを保存</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  setInput: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 60,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  bottomSaveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomSaveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  bottomSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});