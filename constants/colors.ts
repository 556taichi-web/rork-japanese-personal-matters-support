// ダークテーマ - グラデーションカラーパレット
export const Colors = {
  // Background gradients - スクリーンショット参考
  backgroundGradient: ['#1a1a2e', '#16213e', '#0f3460'] as const,
  surfaceGradient: ['#2a2a4a', '#1e2a5a', '#1a2650'] as const,
  
  // Primary colors - 青紫系グラデーション
  primary: '#4f46e5',
  primaryLight: '#6366f1',
  primaryDark: '#3730a3',
  
  // Secondary colors - シアン系
  secondary: '#06b6d4',
  secondaryLight: '#0891b2',
  accent: '#8b5cf6',
  
  // Dark theme backgrounds
  background: '#0f0f23',
  surface: '#1a1a2e',
  surfaceSecondary: '#252545',
  surfaceTertiary: '#2a2a4a',
  
  // Text colors for dark theme
  textPrimary: '#ffffff',
  textSecondary: '#e2e8f0',
  textTertiary: '#cbd5e1',
  textMuted: '#94a3b8',
  
  // Status colors - ダークテーマ対応
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Macro colors (栄養素用) - より鮮やかに
  carbs: '#06b6d4',
  protein: '#8b5cf6',
  fat: '#f59e0b',
  
  // Border and divider - ダーク用
  border: '#374151',
  divider: '#4b5563',
  
  // Shadow - ダーク用
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Glass effect
  glass: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
};

// Legacy export for compatibility
const tintColorDark = Colors.primary;

export default {
  dark: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: tintColorDark,
    tabIconDefault: Colors.textMuted,
    tabIconSelected: tintColorDark,
  },
};