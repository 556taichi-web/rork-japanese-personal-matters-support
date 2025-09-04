import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Dumbbell, Utensils, ChevronRight } from 'lucide-react-native';

export default function RecordScreen() {
  const handleWorkoutRecord = () => {
    router.push('/record/workout');
  };

  const handleMealRecord = () => {
    router.push('/record/meal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>記録を追加</Text>
        <Text style={styles.subtitle}>今日の活動を記録しましょう</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard} onPress={handleWorkoutRecord}>
            <View style={styles.iconContainer}>
              <Dumbbell size={48} color="#FF6B9D" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>トレーニング記録</Text>
              <Text style={styles.optionDescription}>
                セット数、レップ数、重量を記録
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard} onPress={handleMealRecord}>
            <View style={styles.iconContainer}>
              <Utensils size={48} color="#4ECDC4" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>食事記録</Text>
              <Text style={styles.optionDescription}>
                写真撮影または手動入力で記録
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
});