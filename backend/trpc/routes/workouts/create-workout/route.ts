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
    console.log('=== CREATE WORKOUT START ===');
    console.log('User ID:', ctx.user.id);
    console.log('Input data:', JSON.stringify(input, null, 2));
    
    const { workout_items, ...workoutData } = input;
    
    try {
      // Create workout
      const workoutInsertData: Database['public']['Tables']['workouts']['Insert'] = {
        ...workoutData,
        user_id: ctx.user.id,
      };
      
      console.log('=== INSERTING WORKOUT ===');
      console.log('Workout data:', JSON.stringify(workoutInsertData, null, 2));
      
      const { data: workout, error: workoutError } = await (ctx.supabase as any)
        .from('workouts')
        .insert(workoutInsertData)
        .select()
        .single();

      if (workoutError) {
        console.error('=== WORKOUT INSERT ERROR ===');
        console.error('Error details:', workoutError);
        console.error('Error code:', workoutError.code);
        console.error('Error message:', workoutError.message);
        console.error('Error hint:', workoutError.hint);
        throw new Error(`Failed to create workout: ${workoutError.message}`);
      }

      console.log('=== WORKOUT CREATED SUCCESSFULLY ===');
      console.log('Created workout:', JSON.stringify(workout, null, 2));

      // Create workout items if provided
      if (workout_items && workout_items.length > 0) {
        console.log('=== PROCESSING WORKOUT ITEMS ===');
        console.log('Number of items to insert:', workout_items.length);
        
        const workoutItems: Database['public']['Tables']['workout_items']['Insert'][] = workout_items.map((item, index) => {
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
          console.log(`Item ${index + 1}:`, JSON.stringify(processedItem, null, 2));
          return processedItem;
        });

        console.log('=== INSERTING WORKOUT ITEMS ===');
        console.log('Items to insert:', JSON.stringify(workoutItems, null, 2));

        const { data: insertedItems, error: itemsError } = await (ctx.supabase as any)
          .from('workout_items')
          .insert(workoutItems)
          .select();

        if (itemsError) {
          console.error('=== WORKOUT ITEMS INSERT ERROR ===');
          console.error('Error details:', itemsError);
          console.error('Error code:', itemsError.code);
          console.error('Error message:', itemsError.message);
          console.error('Error hint:', itemsError.hint);
          throw new Error(`Failed to create workout exercises: ${itemsError.message}`);
        }

        console.log('=== WORKOUT ITEMS CREATED SUCCESSFULLY ===');
        console.log('Inserted items count:', insertedItems?.length || 0);
        console.log('Inserted items:', JSON.stringify(insertedItems, null, 2));
      } else {
        console.log('=== NO WORKOUT ITEMS TO INSERT ===');
      }

      // Fetch the complete workout with items
      console.log('=== FETCHING COMPLETE WORKOUT ===');
      const { data: completeWorkout, error: fetchError } = await (ctx.supabase as any)
        .from('workouts')
        .select(`
          *,
          workout_items(*)
        `)
        .eq('id', workout!.id)
        .single();

      if (fetchError) {
        console.error('=== FETCH COMPLETE WORKOUT ERROR ===');
        console.error('Error details:', fetchError);
        throw new Error(`Failed to fetch created workout: ${fetchError.message}`);
      }

      console.log('=== COMPLETE WORKOUT FETCHED ===');
      console.log('Complete workout:', JSON.stringify(completeWorkout, null, 2));
      console.log('=== CREATE WORKOUT SUCCESS ===');
      return completeWorkout;
    } catch (error) {
      console.error('=== UNEXPECTED ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('=== CREATE WORKOUT FAILED ===');
      throw error;
    }
  });