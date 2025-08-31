import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const getNutritionLogsSchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(50),
});

export const getNutritionLogsProcedure = protectedProcedure
  .input(getNutritionLogsSchema)
  .query(async ({ ctx, input }) => {
    console.log('Getting nutrition logs for user:', ctx.user.id, input);
    
    let query = ctx.supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false })
      .limit(input.limit);

    if (input.date) {
      query = query.eq('date', input.date);
    } else {
      if (input.startDate) {
        query = query.gte('date', input.startDate);
      }
      if (input.endDate) {
        query = query.lte('date', input.endDate);
      }
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching nutrition logs:', error);
      throw new Error('Failed to fetch nutrition logs');
    }

    return logs || [];
  });