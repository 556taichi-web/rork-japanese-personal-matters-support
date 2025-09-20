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
    console.log('Creating workout for user:', ctx.user.id);
    console.log('Input data:', JSON.stringify(input, null, 2));
    
    const { workout_items, ...workoutData } = input;
    
    try {
      // Create workout
      const workoutInsertData: Database['public']['Tables']['workouts']['Insert'] = {
        ...workoutData,
        user_id: ctx.user.id,
      };
      
      console.log('Inserting workout:', JSON.stringify(workoutInsertData, null, 2));
      
      const { data: workout, error: workoutError } = await (ctx.supabase as any)
        .from('workouts')
        .insert(workoutInsertData)
        .select()
        .single();

      if (workoutError) {
        console.error('Error creating workout:', workoutError);
        throw new Error(`Failed to create workout: ${workoutError.message}`);
      }

      console.log('Workout created successfully:', workout);

      // Create workout items if provided
      if (workout_items && workout_items.length > 0) {
        const workoutItems: Database['public']['Tables']['workout_items']['Insert'][] = workout_items.map(item => {
          const processedItem = {
            workout_id: workout!.id,
            exercise_name: item.exercise_name,
            sets: item.sets || null,
            reps: item.reps || null,
            weight_kg: item.weight_kg,
            duration_seconds: item.duration_seconds,
            rest_seconds: item.rest_seconds,
            notes: item.notes,
          };
          console.log('Processing workout item:', JSON.stringify(processedItem, null, 2));
          return processedItem;
        });

        console.log('Inserting workout items:', JSON.stringify(workoutItems, null, 2));

        const { data: insertedItems, error: itemsError } = await (ctx.supabase as any)
          .from('workout_items')
          .insert(workoutItems)
          .select();

        if (itemsError) {
          console.error('Error creating workout items:', itemsError);
          throw new Error(`Failed to create workout exercises: ${itemsError.message}`);
        }

        console.log('Workout items created successfully:', insertedItems);
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
        throw new Error(`Failed to fetch created workout: ${fetchError.message}`);
      }

      console.log('Complete workout fetched:', JSON.stringify(completeWorkout, null, 2));
      return completeWorkout;
    } catch (error) {
      console.error('Unexpected error in createWorkoutProcedure:', error);
      throw error;
    }
  });