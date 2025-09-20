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
  workout_items: {
    exercise_name: string;
    sets?: number | null;
    reps?: number | null;
    weight_kg?: number | null;
    duration_seconds?: number | null;
    rest_seconds?: number | null;
    notes?: string | null;
  }[];
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
      console.log('useCreateWorkout: Starting mutation with data:', workoutData);
      console.log('useCreateWorkout: User ID:', user?.id);
      
      if (!user?.id) {
        console.error('useCreateWorkout: User not authenticated');
        throw new Error('User not authenticated');
      }
      
      // Create workout
      const workoutInsertData = {
        user_id: user.id,
        title: workoutData.title,
        description: workoutData.description,
        date: workoutData.date,
        duration_minutes: workoutData.duration_minutes,
        calories_burned: workoutData.calories_burned,
      };
      
      console.log('useCreateWorkout: Inserting workout:', workoutInsertData);
      
      const { data: workout, error: workoutError } = await (supabase as any)
        .from('workouts')
        .insert(workoutInsertData)
        .select()
        .single();
      
      if (workoutError) {
        console.error('useCreateWorkout: Workout creation error:', workoutError);
        throw new Error(`Failed to create workout: ${workoutError.message}`);
      }
      
      console.log('useCreateWorkout: Workout created successfully:', workout);
      
      // Create workout items
      if (workoutData.workout_items.length > 0) {
        const workoutItemsData = workoutData.workout_items.map(item => ({
          ...item,
          workout_id: workout!.id,
        }));
        
        console.log('useCreateWorkout: Inserting workout items:', workoutItemsData);
        
        const { error: itemsError } = await (supabase as any)
          .from('workout_items')
          .insert(workoutItemsData);
        
        if (itemsError) {
          console.error('useCreateWorkout: Workout items creation error:', itemsError);
          throw new Error(`Failed to create workout exercises: ${itemsError.message}`);
        }
        
        console.log('useCreateWorkout: Workout items created successfully');
      }
      
      console.log('useCreateWorkout: Mutation completed successfully');
      return workout;
    },
    onSuccess: (data) => {
      console.log('useCreateWorkout: onSuccess called with data:', data);
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] });
    },
    onError: (error) => {
      console.error('useCreateWorkout: onError called with error:', error);
    },
  });
}