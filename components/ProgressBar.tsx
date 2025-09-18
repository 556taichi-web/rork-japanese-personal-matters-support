import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}

export function ProgressBar({ 
  label, 
  value, 
  target, 
  unit, 
  color, 
  icon 
}: ProgressBarProps) {
  const progress = Math.min(value / target, 1);
  const percentage = Math.round((value / target) * 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              {icon}
            </View>
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          <Text style={styles.currentValue}>{value.toLocaleString()}</Text>
          <Text style={styles.targetValue}> / {target.toLocaleString()} {unit}</Text>
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress * 100}%`, 
                backgroundColor: color 
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  valueContainer: {
    marginBottom: 12,
  },
  value: {
    fontSize: 16,
  },
  currentValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  targetValue: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  progressContainer: {
    height: 6,
  },
  progressBackground: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});