import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type NutritionLog } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface NutritionQueryOptions {
  date?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

interface CreateNutritionLogData {
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  image_url?: string;
  ai_analysis?: string;
}

export function useNutritionLogs(options?: NutritionQueryOptions) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['nutrition-logs', user?.id, options],
    queryFn: async (): Promise<NutritionLog[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      let query = supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (options?.date) {
        query = query.eq('date', options.date);
      }
      
      if (options?.startDate && options?.endDate) {
        query = query
          .gte('date', options.startDate)
          .lte('date', options.endDate);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useCreateNutritionLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logData: CreateNutritionLogData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert({
          ...logData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs', user?.id] });
    },
  });
}