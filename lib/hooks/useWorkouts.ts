import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type Workout, type WorkoutItem } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface WorkoutWithItems extends Workout {
  workout_items: WorkoutItem[];
}

interface CreateWorkoutData {
  title: string;
  description?: string;
  date: string;
  duration_minutes?: number;
  calories_burned?: number;
  workout_items: Omit<WorkoutItem, 'id' | 'workout_id' | 'created_at'>[];
}

export function useWorkouts(options?: { limit?: number }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['workouts', user?.id, options?.limit],
    queryFn: async (): Promise<WorkoutWithItems[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_items (*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
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

export function useCreateWorkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workoutData: CreateWorkoutData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          title: workoutData.title,
          description: workoutData.description,
          date: workoutData.date,
          duration_minutes: workoutData.duration_minutes,
          calories_burned: workoutData.calories_burned,
        })
        .select()
        .single();
      
      if (workoutError) throw workoutError;
      
      // Create workout items
      if (workoutData.workout_items.length > 0) {
        const { error: itemsError } = await supabase
          .from('workout_items')
          .insert(
            workoutData.workout_items.map(item => ({
              ...item,
              workout_id: workout.id,
            }))
          );
        
        if (itemsError) throw itemsError;
      }
      
      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] });
    },
  });
}