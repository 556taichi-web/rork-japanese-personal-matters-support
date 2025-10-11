import { protectedProcedure } from '../../../create-context';

export const getUserContextProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('Getting user context for RAG:', ctx.user.id);
    
    const { data: profile, error: profileError } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: recentWorkouts, error: workoutsError } = await ctx.supabase
      .from('workouts')
      .select(`
        *,
        workout_items(*)
      `)
      .eq('user_id', ctx.user.id)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false })
      .limit(20);

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
    }

    const { data: recentNutrition, error: nutritionError } = await ctx.supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false })
      .limit(30);

    if (nutritionError) {
      console.error('Error fetching nutrition:', nutritionError);
    }

    const { data: todayNutrition, error: todayNutritionError } = await ctx.supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .eq('date', today);

    if (todayNutritionError) {
      console.error('Error fetching today nutrition:', todayNutritionError);
    }

    const todayCalories = todayNutrition?.reduce((sum, log: any) => sum + (log.calories || 0), 0) || 0;
    const todayProtein = todayNutrition?.reduce((sum, log: any) => sum + (log.protein || 0), 0) || 0;
    const todayFat = todayNutrition?.reduce((sum, log: any) => sum + (log.fat || 0), 0) || 0;
    const todayCarbs = todayNutrition?.reduce((sum, log: any) => sum + (log.carbs || 0), 0) || 0;

    const workoutStats = {
      totalWorkouts: recentWorkouts?.length || 0,
      recentExercises: recentWorkouts?.flatMap((w: any) => 
        w.workout_items?.map((item: any) => item.exercise_name) || []
      ).slice(0, 10) || [],
      lastWorkoutDate: (recentWorkouts as any)?.[0]?.date || null,
    };

    const nutritionStats = {
      avgDailyCalories: recentNutrition && recentNutrition.length > 0
        ? Math.round(recentNutrition.reduce((sum, log: any) => sum + (log.calories || 0), 0) / 
          new Set(recentNutrition.map((log: any) => log.date)).size)
        : 0,
      todayCalories,
      todayProtein,
      todayFat,
      todayCarbs,
    };

    return {
      profile: profile || null,
      workoutStats,
      nutritionStats,
      recentWorkouts: recentWorkouts || [],
      recentNutrition: recentNutrition || [],
    };
  });
