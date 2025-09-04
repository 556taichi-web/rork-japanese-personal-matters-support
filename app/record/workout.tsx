import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Minus, Save } from 'lucide-react-native';
import { EXERCISE_CATEGORIES, getExercisesByCategory, Exercise } from '@/constants/exercises';
import { trpc } from '@/lib/trpc';

interface WorkoutSet {
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export default function WorkoutRecordScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([{ reps: 0, weight: 0 }]);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createWorkoutMutation = trpc.workouts.create.useMutation();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedExercise(null);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentSets([{ reps: 0, weight: 0 }]);
    setNotes('');
  };

  const addSet = () => {
    setCurrentSets([...currentSets, { reps: 0, weight: 0 }]);
  };

  const removeSet = (index: number) => {
    if (currentSets.length > 1) {
      setCurrentSets(currentSets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: 'reps' | 'weight', value: string) => {
    const numValue = parseInt(value) || 0;
    const updatedSets = [...currentSets];
    updatedSets[index] = { ...updatedSets[index], [field]: numValue };
    setCurrentSets(updatedSets);
  };

  const addExerciseToWorkout = () => {
    if (!selectedExercise) return;

    const workoutExercise: WorkoutExercise = {
      exercise: selectedExercise,
      sets: currentSets.filter(set => set.reps > 0 || set.weight > 0),
      notes: notes.trim(),
    };

    if (workoutExercise.sets.length === 0) {
      Alert.alert('エラー', 'セット数またはレップ数を入力してください。');
      return;
    }

    setWorkoutExercises([...workoutExercises, workoutExercise]);
    setSelectedExercise(null);
    setCurrentSets([{ reps: 0, weight: 0 }]);
    setNotes('');
    Alert.alert('追加完了', `${selectedExercise.name}をワークアウトに追加しました。`);
  };

  const saveWorkout = async () => {
    if (workoutExercises.length === 0) {
      Alert.alert('エラー', '少なくとも1つのエクササイズを追加してください。');
      return;
    }

    try {
      setIsLoading(true);
      
      const workoutData = {
        title: `${new Date().toLocaleDateString()}のワークアウト`,
        description: `${workoutExercises.length}種目のトレーニング`,
        date: new Date().toISOString().split('T')[0],
        duration_minutes: 60,
        exercises: workoutExercises.map(we => ({
          exercise_name: we.exercise.name,
          sets: we.sets.length,
          reps: Math.max(...we.sets.map(s => s.reps)),
          weight_kg: Math.max(...we.sets.map(s => s.weight)),
          notes: we.notes || '',
        })),
      };

      await createWorkoutMutation.mutateAsync(workoutData);
      Alert.alert('保存完了', 'ワークアウトが保存されました。', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('エラー', 'ワークアウトの保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategorySelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>トレーニング部位を選択</Text>
      <View style={styles.categoryGrid}>
        {EXERCISE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryCard,
              selectedCategory === category && styles.selectedCategoryCard,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExerciseSelection = () => {
    if (!selectedCategory) return null;

    const exercises = getExercisesByCategory(selectedCategory);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>エクササイズを選択</Text>
        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                selectedExercise?.id === exercise.id && styles.selectedExerciseCard,
              ]}
              onPress={() => handleExerciseSelect(exercise)}
            >
              <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDescription}>
                  {exercise.muscle_groups.join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSetInput = () => {
    if (!selectedExercise) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{selectedExercise.name} - セット入力</Text>
        
        {currentSets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={styles.setNumber}>セット {index + 1}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>レップ数</Text>
              <TextInput
                style={styles.input}
                value={set.reps.toString()}
                onChangeText={(value) => updateSet(index, 'reps', value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>重量 (kg)</Text>
              <TextInput
                style={styles.input}
                value={set.weight.toString()}
                onChangeText={(value) => updateSet(index, 'weight', value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            
            {currentSets.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeSet(index)}
              >
                <Minus size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
          <Plus size={20} color="#10B981" />
          <Text style={styles.addSetText}>セットを追加</Text>
        </TouchableOpacity>
        
        <View style={styles.notesSection}>
          <Text style={styles.inputLabel}>メモ（任意）</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="フォームのポイントや感想など..."
            multiline
            numberOfLines={3}
          />
        </View>
        
        <TouchableOpacity style={styles.addExerciseButton} onPress={addExerciseToWorkout}>
          <Text style={styles.addExerciseText}>エクササイズを追加</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWorkoutSummary = () => {
    if (workoutExercises.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日のワークアウト</Text>
        {workoutExercises.map((we, index) => (
          <View key={index} style={styles.summaryCard}>
            <Text style={styles.summaryExerciseName}>{we.exercise.name}</Text>
            <Text style={styles.summaryDetails}>
              {we.sets.length}セット × {we.sets.map(s => `${s.reps}回`).join(', ')}
            </Text>
            {we.notes && (
              <Text style={styles.summaryNotes}>メモ: {we.notes}</Text>
            )}
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveWorkout}
          disabled={isLoading}
        >
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {isLoading ? '保存中...' : 'ワークアウトを保存'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>トレーニング記録</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCategorySelection()}
        {renderExerciseSelection()}
        {renderSetInput()}
        {renderWorkoutSummary()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedCategoryCard: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F7',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
  selectedCategoryText: {
    color: '#FF6B9D',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedExerciseCard: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F7',
  },
  exerciseIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#718096',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    width: 60,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  addSetText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addExerciseButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  summaryExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  summaryDetails: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  summaryNotes: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});