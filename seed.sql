-- Seed data for testing
-- This file should be run after schema.sql

-- Insert sample profiles (these will be created automatically via trigger when users sign up)
-- But we can insert some sample data for testing

-- Sample nutrition targets
INSERT INTO public.nutrition_targets (user_id, date, target_calories, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g)
SELECT 
  id,
  CURRENT_DATE,
  CASE 
    WHEN fitness_goal = 'lose_weight' THEN 1500
    WHEN fitness_goal = 'gain_weight' THEN 2500
    ELSE 2000
  END,
  CASE 
    WHEN fitness_goal = 'build_muscle' THEN 120
    ELSE 80
  END,
  200,
  60,
  25
FROM public.profiles
ON CONFLICT (user_id, date) DO NOTHING;

-- Sample workouts
INSERT INTO public.workouts (user_id, title, description, date, duration_minutes, calories_burned)
SELECT 
  id,
  'Upper Body Strength Training',
  'Focus on chest, shoulders, and arms with compound movements',
  CURRENT_DATE - INTERVAL '1 day',
  45,
  300
FROM public.profiles
LIMIT 3;

INSERT INTO public.workouts (user_id, title, description, date, duration_minutes, calories_burned)
SELECT 
  id,
  'Cardio Session',
  'High intensity interval training on treadmill',
  CURRENT_DATE - INTERVAL '2 days',
  30,
  250
FROM public.profiles
LIMIT 3;

-- Sample workout items
INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, notes)
SELECT 
  w.id,
  'Push-ups',
  3,
  12,
  NULL,
  'Focus on proper form'
FROM public.workouts w
WHERE w.title = 'Upper Body Strength Training'
LIMIT 3;

INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, notes)
SELECT 
  w.id,
  'Bench Press',
  3,
  10,
  60.0,
  'Increase weight next session'
FROM public.workouts w
WHERE w.title = 'Upper Body Strength Training'
LIMIT 3;

INSERT INTO public.workout_items (workout_id, exercise_name, duration_seconds, notes)
SELECT 
  w.id,
  'Treadmill Running',
  1800,
  '6 mph average pace'
FROM public.workouts w
WHERE w.title = 'Cardio Session'
LIMIT 3;

-- Sample nutrition logs
INSERT INTO public.nutrition_logs (user_id, date, meal_type, food_name, quantity, unit, calories, protein_g, carbs_g, fat_g)
SELECT 
  id,
  CURRENT_DATE,
  'breakfast',
  'Oatmeal with berries',
  1,
  'bowl',
  350,
  12,
  65,
  8
FROM public.profiles
LIMIT 3;

INSERT INTO public.nutrition_logs (user_id, date, meal_type, food_name, quantity, unit, calories, protein_g, carbs_g, fat_g)
SELECT 
  id,
  CURRENT_DATE,
  'lunch',
  'Grilled chicken salad',
  1,
  'plate',
  450,
  35,
  20,
  18
FROM public.profiles
LIMIT 3;

INSERT INTO public.nutrition_logs (user_id, date, meal_type, food_name, quantity, unit, calories, protein_g, carbs_g, fat_g)
SELECT 
  id,
  CURRENT_DATE,
  'dinner',
  'Salmon with quinoa',
  1,
  'plate',
  520,
  40,
  45,
  22
FROM public.profiles
LIMIT 3;

-- Sample daily summaries
INSERT INTO public.summaries (user_id, summary_type, date, content, ai_recommendations)
SELECT 
  id,
  'daily',
  CURRENT_DATE - INTERVAL '1 day',
  jsonb_build_object(
    'total_calories', 1320,
    'total_protein', 87,
    'total_carbs', 130,
    'total_fat', 48,
    'workouts_completed', 1,
    'calories_burned', 300
  ),
  'Great job on completing your workout! Consider adding more vegetables to increase fiber intake. Your protein intake is on track for your fitness goals.'
FROM public.profiles
LIMIT 3;