// クールで落ち着いたトーンのカラーパレット
export const Colors = {
  // Primary colors - クールなブルー系
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  
  // Secondary colors - アクセント用
  secondary: '#06B6D4',
  secondaryLight: '#0891B2',
  
  // Neutral colors - 落ち着いたグレー系
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  
  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textMuted: '#94A3B8',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Macro colors (栄養素用)
  carbs: '#06B6D4',
  protein: '#8B5CF6',
  fat: '#F59E0B',
  
  // Border and divider
  border: '#E2E8F0',
  divider: '#F1F5F9',
  
  // Shadow
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.16)',
};

// Legacy export for compatibility
const tintColorLight = Colors.primary;
const tintColorDark = '#fff';

export default {
  light: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: tintColorLight,
    tabIconDefault: Colors.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};