import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dumbbell, Utensils, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function RecordScreen() {
  const handleWorkoutRecord = () => {
    router.push('/workout/add');
  };

  const handleMealRecord = () => {
    router.push('/meal/add');
  };

  return (
    <LinearGradient
      colors={Colors.backgroundGradient}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>記録を追加</Text>
          <Text style={styles.subtitle}>今日の活動を記録しましょう</Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={handleWorkoutRecord}>
              <LinearGradient
                colors={Colors.surfaceGradient}
                style={styles.optionCard}
              >
                <LinearGradient
                  colors={[Colors.success + '20', Colors.success + '10']}
                  style={styles.iconContainer}
                >
                  <Dumbbell size={48} color={Colors.success} />
                </LinearGradient>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>トレーニング記録</Text>
                  <Text style={styles.optionDescription}>
                    セット数、レップ数、重量を記録
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.textTertiary} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleMealRecord}>
              <LinearGradient
                colors={Colors.surfaceGradient}
                style={styles.optionCard}
              >
                <LinearGradient
                  colors={[Colors.primary + '20', Colors.primary + '10']}
                  style={styles.iconContainer}
                >
                  <Utensils size={48} color={Colors.primary} />
                </LinearGradient>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>食事記録</Text>
                  <Text style={styles.optionDescription}>
                    写真撮影または手動入力で記録
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.textTertiary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});