import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface MacroCircleProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  size?: number;
}

export function MacroCircle({ 
  label, 
  value, 
  target, 
  unit, 
  color, 
  size = 80 
}: MacroCircleProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / target, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  const percentage = Math.round((value / target) * 100);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.divider}
          strokeWidth={4}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={4}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  unit: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: -2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  percentage: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});