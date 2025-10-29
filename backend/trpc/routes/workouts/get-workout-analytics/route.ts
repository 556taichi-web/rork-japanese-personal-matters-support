import { protectedProcedure } from '../../../create-context';
import { EXERCISE_PRESETS } from '@/constants/exercises';

interface WorkoutAnalyticsData {
  date: string;
  exercise_name: string;
  max_weight: number;
  total_volume: number;
  sets: number;
  category: string;
}

export const getWorkoutAnalyticsProcedure = protectedProcedure.query(async ({ ctx }): Promise<Record<string, WorkoutAnalyticsData[]>> => {
  const userId = ctx.user.id;

  console.log('getWorkoutAnalytics: Fetching workout analytics for user:', userId);

  const { data: workouts, error: workoutsError } = await ctx.supabase
    .from('workouts')
    .select(`
      id,
      date,
      workout_items (
        exercise_name,
        sets,
        reps,
        weight_kg
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (workoutsError) {
    console.error('getWorkoutAnalytics: Error fetching workouts:', workoutsError);
    throw new Error('Failed to fetch workouts');
  }

  console.log('getWorkoutAnalytics: Fetched workouts:', workouts?.length);

  const analyticsMap = new Map<string, WorkoutAnalyticsData[]>();

  workouts?.forEach((workout: any) => {
    workout.workout_items?.forEach((item: any) => {
      const exercise = EXERCISE_PRESETS.find(
        (e) => e.name === item.exercise_name || e.english_name === item.exercise_name
      );

      if (!exercise) return;

      const category = exercise.category;
      const weight = item.weight_kg || 0;
      const volume = (item.sets || 0) * (item.reps || 0) * weight;

      if (!analyticsMap.has(category)) {
        analyticsMap.set(category, []);
      }

      const existing = analyticsMap.get(category)!.find(
        (d) => d.date === workout.date && d.exercise_name === item.exercise_name
      );

      if (existing) {
        existing.max_weight = Math.max(existing.max_weight, weight);
        existing.total_volume += volume;
        existing.sets += item.sets || 0;
      } else {
        analyticsMap.get(category)!.push({
          date: workout.date,
          exercise_name: item.exercise_name,
          max_weight: weight,
          total_volume: volume,
          sets: item.sets || 0,
          category,
        });
      }
    });
  });

  const result: Record<string, WorkoutAnalyticsData[]> = {};
  analyticsMap.forEach((value, key) => {
    result[key] = value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  console.log('getWorkoutAnalytics: Processed analytics for categories:', Object.keys(result));

  return result;
});
