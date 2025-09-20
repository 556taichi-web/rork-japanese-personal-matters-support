import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { Database } from '@/lib/supabase';

const createWorkoutSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  duration_minutes: z.number().optional(),
  calories_burned: z.number().optional(),
  video_url: z.string().optional(),
  workout_items: z.array(z.object({
    exercise_name: z.string().min(1),
    sets: z.number().optional(),
    reps: z.number().optional(),
    weight_kg: z.number().optional().nullable(),
    duration_seconds: z.number().optional().nullable(),
    rest_seconds: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
  })).optional(),
});

export const createWorkoutProcedure = protectedProcedure
  .input(createWorkoutSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('Creating workout for user:', ctx.user.id, input);
    
    const { workout_items, ...workoutData } = input;
    
    // Create workout
    const workoutInsertData: Database['public']['Tables']['workouts']['Insert'] = {
      ...workoutData,
      user_id: ctx.user.id,
    };
    
    const { data: workout, error: workoutError } = await (ctx.supabase as any)
      .from('workouts')
      .insert(workoutInsertData)
      .select()
      .single();

    if (workoutError) {
      console.error('Error creating workout:', workoutError);
      throw new Error('Failed to create workout');
    }

    // Create workout items if provided
    if (workout_items && workout_items.length > 0) {
      const workoutItems: Database['public']['Tables']['workout_items']['Insert'][] = workout_items.map(item => ({
        ...item,
        workout_id: workout!.id,
      }));

      const { error: itemsError } = await (ctx.supabase as any)
        .from('workout_items')
        .insert(workoutItems);

      if (itemsError) {
        console.error('Error creating workout items:', itemsError);
        throw new Error('Failed to create workout exercises');
      }
    }

    // Fetch the complete workout with items
    const { data: completeWorkout, error: fetchError } = await (ctx.supabase as any)
      .from('workouts')
      .select(`
        *,
        workout_items(*)
      `)
      .eq('id', workout!.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete workout:', fetchError);
      throw new Error('Failed to fetch created workout');
    }

    return completeWorkout;
  });