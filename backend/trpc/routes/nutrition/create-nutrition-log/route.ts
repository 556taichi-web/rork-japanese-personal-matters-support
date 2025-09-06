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
    
    try {
      const insertData: Database['public']['Tables']['nutrition_logs']['Insert'] = {
        user_id: ctx.user.id,
        date: input.date,
        meal_type: input.meal_type,
        food_name: input.food_name,
        quantity: input.quantity,
        unit: input.unit,
        calories: input.calories || null,
        protein_g: input.protein_g || null,
        carbs_g: input.carbs_g || null,
        fat_g: input.fat_g || null,
        fiber_g: input.fiber_g || null,
        image_url: input.image_url || null,
        ai_analysis: input.ai_analysis || null,
      };
      
      console.log('Inserting data:', insertData);
      
      const { data: log, error } = await (ctx.supabase as any)
        .from('nutrition_logs')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating nutrition log:', error);
        throw new Error(`Failed to create nutrition log: ${error.message}`);
      }

      console.log('Successfully created nutrition log:', log);
      return log;
    } catch (error) {
      console.error('Error in createNutritionLogProcedure:', error);
      throw error;
    }
  });