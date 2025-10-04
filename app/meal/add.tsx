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
import { 
  Plus, 
  Save, 
  X,
  Coffee,
  Sun,
  Moon,
  Apple
} from 'lucide-react-native';
import { useCreateNutritionLog } from '@/lib/hooks/useNutrition';
import { Colors } from '@/constants/colors';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealEntry {
  id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories?: number;
}

interface MealSection {
  type: MealType;
  name: string;
  icon: React.ReactNode;
  color: string;
  entries: MealEntry[];
}

export default function AddMealScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<MealSection[]>([
    {
      type: 'breakfast',
      name: '朝食',
      icon: <Sun size={20} color="#F59E0B" />,
      color: '#F59E0B',
      entries: []
    },
    {
      type: 'lunch',
      name: '昼食',
      icon: <Coffee size={20} color="#EF4444" />,
      color: '#EF4444',
      entries: []
    },
    {
      type: 'dinner',
      name: '夕食',
      icon: <Moon size={20} color="#8B5CF6" />,
      color: '#8B5CF6',
      entries: []
    },
    {
      type: 'snack',
      name: 'おやつ',
      icon: <Apple size={20} color="#10B981" />,
      color: '#10B981',
      entries: []
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createNutritionLogMutation = useCreateNutritionLog();

  const addMealEntry = (mealType: MealType) => {
    const newEntry: MealEntry = {
      id: Date.now().toString(),
      food_name: '',
      quantity: 1,
      unit: '個',
      calories: 0
    };

    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.type === mealType 
          ? { ...meal, entries: [...meal.entries, newEntry] }
          : meal
      )
    );
  };

  const removeMealEntry = (mealType: MealType, entryId: string) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.type === mealType 
          ? { ...meal, entries: meal.entries.filter(entry => entry.id !== entryId) }
          : meal
      )
    );
  };

  const updateMealEntry = (mealType: MealType, entryId: string, field: keyof MealEntry, value: string | number) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.type === mealType 
          ? {
              ...meal,
              entries: meal.entries.map(entry => 
                entry.id === entryId 
                  ? { ...entry, [field]: value }
                  : entry
              )
            }
          : meal
      )
    );
  };

  const saveMeals = async () => {
    const allEntries = meals.flatMap(meal => 
      meal.entries.filter(entry => entry.food_name.trim() !== '')
        .map(entry => ({
          ...entry,
          meal_type: meal.type,
          date: selectedDate
        }))
    );

    if (allEntries.length === 0) {
      Alert.alert('エラー', '少なくとも1つの食事を記録してください');
      return;
    }

    setIsLoading(true);

    try {
      // Save each entry individually
      for (const entry of allEntries) {
        await createNutritionLogMutation.mutateAsync({
          date: entry.date,
          meal_type: entry.meal_type,
          food_name: entry.food_name,
          quantity: entry.quantity,
          unit: entry.unit,
          calories: entry.calories || 0
        });
      }
      Alert.alert('成功', '食事記録が保存されました', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save meals error:', error);
      Alert.alert('エラー', '食事記録の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalCalories = () => {
    return meals.reduce((total, meal) => 
      total + meal.entries.reduce((mealTotal, entry) => 
        mealTotal + (entry.calories || 0), 0
      ), 0
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: '食事を記録',
          headerRight: () => (
            <TouchableOpacity 
              onPress={saveMeals}
              disabled={isLoading}
              style={styles.saveButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF6B9D" />
              ) : (
                <Save size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>記録日</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.caloriesCard}>
          <Text style={styles.caloriesLabel}>合計カロリー</Text>
          <Text style={styles.caloriesValue}>{getTotalCalories().toLocaleString()} kcal</Text>
        </View>

        {meals.map((meal) => (
          <View key={meal.type} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <View style={[styles.mealIcon, { backgroundColor: meal.color }]}>
                {meal.icon}
              </View>
              <Text style={styles.mealName}>{meal.name}</Text>
              <TouchableOpacity
                style={styles.addMealButton}
                onPress={() => addMealEntry(meal.type)}
              >
                <Plus size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {meal.entries.length === 0 ? (
              <View style={styles.emptyMeal}>
                <Text style={styles.emptyMealText}>食事を追加してください</Text>
              </View>
            ) : (
              meal.entries.map((entry) => (
                <View key={entry.id} style={styles.mealEntry}>
                  <View style={styles.entryRow}>
                    <TextInput
                      style={[styles.entryInput, styles.foodNameInput]}
                      value={entry.food_name}
                      onChangeText={(value) => updateMealEntry(meal.type, entry.id, 'food_name', value)}
                      placeholder="食べ物の名前"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      onPress={() => removeMealEntry(meal.type, entry.id)}
                      style={styles.removeEntryButton}
                    >
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.entryDetailsRow}>
                    <View style={styles.quantityContainer}>
                      <TextInput
                        style={styles.quantityInput}
                        value={entry.quantity.toString()}
                        onChangeText={(value) => updateMealEntry(meal.type, entry.id, 'quantity', parseFloat(value) || 0)}
                        placeholder="1"
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        style={styles.unitInput}
                        value={entry.unit}
                        onChangeText={(value) => updateMealEntry(meal.type, entry.id, 'unit', value)}
                        placeholder="個"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    <View style={styles.caloriesContainer}>
                      <TextInput
                        style={styles.caloriesInput}
                        value={entry.calories?.toString() || ''}
                        onChangeText={(value) => updateMealEntry(meal.type, entry.id, 'calories', parseInt(value) || 0)}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.caloriesUnit}>kcal</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 記録のコツ</Text>
          <Text style={styles.tipText}>
            • 食べた直後に記録すると忘れにくいです{'\n'}
            • 写真を撮っておくと後で思い出しやすくなります{'\n'}
            • カロリーが分からない場合は概算でも大丈夫です
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  saveButton: {
    padding: 8,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  caloriesCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  caloriesLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  mealSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    opacity: 0.2,
  },
  mealName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addMealButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMeal: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  mealEntry: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  foodNameInput: {
    flex: 1,
    marginRight: 8,
  },
  removeEntryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  quantityInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    marginRight: 8,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  unitInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 60,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 80,
    textAlign: 'center',
    marginRight: 4,
    color: Colors.textPrimary,
  },
  caloriesUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});