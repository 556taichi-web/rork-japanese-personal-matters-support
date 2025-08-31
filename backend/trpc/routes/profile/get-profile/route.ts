import { protectedProcedure } from '../../../create-context';

export const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('Getting profile for user:', ctx.user.id);
    
    const { data: profile, error } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }

    return profile;
  });