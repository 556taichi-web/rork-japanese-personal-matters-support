import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const getWorkoutsSchema = z.object({
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const getWorkoutsProcedure = protectedProcedure
  .input(getWorkoutsSchema)
  .query(async ({ ctx, input }) => {
    console.log('Getting workouts for user:', ctx.user.id, input);
    
    let query = (ctx.supabase as any)
      .from('workouts')
      .select(`
        *,
        workout_items(*)
      `)
      .eq('user_id', ctx.user.id)
      .order('date', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.startDate) {
      query = query.gte('date', input.startDate);
    }
    
    if (input.endDate) {
      query = query.lte('date', input.endDate);
    }

    const { data: workouts, error } = await query;

    if (error) {
      console.error('Error fetching workouts:', error);
      throw new Error('Failed to fetch workouts');
    }

    return workouts || [];
  });