import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { Database } from '@/lib/supabase';

const createNutritionLogSchema = z.object({
  date: z.string(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  food_name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().optional(),
  protein_g: z.number().optional(),
  carbs_g: z.number().optional(),
  fat_g: z.number().optional(),
  fiber_g: z.number().optional(),
  image_url: z.string().optional(),
  ai_analysis: z.string().optional(),
});

export const createNutritionLogProcedure = protectedProcedure
  .input(createNutritionLogSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('Creating nutrition log for user:', ctx.user.id, input);
    
    const insertData: Database['public']['Tables']['nutrition_logs']['Insert'] = {
      ...input,
      user_id: ctx.user.id,
    };
    
    const { data: log, error } = await (ctx.supabase as any)
      .from('nutrition_logs')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition log:', error);
      throw new Error('Failed to create nutrition log');
    }

    return log;
  });