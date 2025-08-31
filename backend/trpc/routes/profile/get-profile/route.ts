import { protectedProcedure } from '../../../create-context';
import { supabase } from '@/lib/supabase';

export const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('Getting profile for user:', ctx.user.id);
    
    const { data: profile, error } = await supabase
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