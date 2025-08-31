import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null;
          fitness_goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_endurance' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null;
          fitness_goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_endurance' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null;
          fitness_goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_endurance' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          date: string;
          duration_minutes: number | null;
          calories_burned: number | null;
          video_url: string | null;
          ai_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          date: string;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          video_url?: string | null;
          ai_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          video_url?: string | null;
          ai_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_items: {
        Row: {
          id: string;
          workout_id: string;
          exercise_name: string;
          sets: number | null;
          reps: number | null;
          weight_kg: number | null;
          duration_seconds: number | null;
          rest_seconds: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_name: string;
          sets?: number | null;
          reps?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rest_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_name?: string;
          sets?: number | null;
          reps?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rest_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      nutrition_targets: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          target_calories: number;
          target_protein_g: number | null;
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_fiber_g: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          target_calories: number;
          target_protein_g?: number | null;
          target_carbs_g?: number | null;
          target_fat_g?: number | null;
          target_fiber_g?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          target_calories?: number;
          target_protein_g?: number | null;
          target_carbs_g?: number | null;
          target_fat_g?: number | null;
          target_fiber_g?: number | null;
          created_at?: string;
        };
      };
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_name: string;
          quantity: number;
          unit: string;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          fiber_g: number | null;
          image_url: string | null;
          ai_analysis: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_name: string;
          quantity: number;
          unit: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          image_url?: string | null;
          ai_analysis?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_name?: string;
          quantity?: number;
          unit?: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          image_url?: string | null;
          ai_analysis?: string | null;
          created_at?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          user_id: string;
          summary_type: 'daily' | 'weekly' | 'monthly';
          date: string;
          content: any;
          ai_recommendations: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          summary_type: 'daily' | 'weekly' | 'monthly';
          date: string;
          content: any;
          ai_recommendations?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          summary_type?: 'daily' | 'weekly' | 'monthly';
          date?: string;
          content?: any;
          ai_recommendations?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Create Supabase client with proper storage for React Native
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Export types for use in components
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutItem = Database['public']['Tables']['workout_items']['Row'];
export type NutritionTarget = Database['public']['Tables']['nutrition_targets']['Row'];
export type NutritionLog = Database['public']['Tables']['nutrition_logs']['Row'];
export type Summary = Database['public']['Tables']['summaries']['Row'];