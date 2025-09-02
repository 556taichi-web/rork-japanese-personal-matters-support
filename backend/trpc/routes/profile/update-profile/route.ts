import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height_cm: z.number().optional(),
  weight_kg: z.number().optional(),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
  fitness_goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_endurance']).optional(),
});

export const updateProfileProcedure = protectedProcedure
  .input(updateProfileSchema)
  .mutation(async ({ ctx, input }) => {
    console.log('Updating profile for user:', ctx.user.id, input);
    
    const updateData = {
      ...input,
      updated_at: new Date().toISOString(),
    };
    
    const { data: profile, error } = await ctx.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', ctx.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }

    return profile;
  });