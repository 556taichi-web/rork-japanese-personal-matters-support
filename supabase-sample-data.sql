-- サンプルワークアウトデータを投入するSQL
-- 既存のworkout_itemsテーブルに追加のサンプルデータを投入

-- 注意: このクエリを実行する前に、適切なuser_idを確認してください
-- 以下のクエリでuser_idを確認できます:
-- SELECT id, email FROM auth.users LIMIT 5;

-- サンプルユーザーIDを取得（実際のuser_idに置き換えてください）
DO $$
DECLARE
    sample_user_id UUID;
    workout1_id UUID;
    workout2_id UUID;
    workout3_id UUID;
BEGIN
    -- 最初のユーザーIDを取得
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- サンプルユーザーが存在しない場合は処理を終了
    IF sample_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Please create a user first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using user_id: %', sample_user_id;
    
    -- サンプルワークアウト1: 胸筋トレーニング
    INSERT INTO public.workouts (id, user_id, title, description, date, duration_minutes, calories_burned)
    VALUES (
        uuid_generate_v4(),
        sample_user_id,
        'Chest Training Session',
        'Comprehensive chest workout focusing on upper, middle, and lower chest',
        '2025-01-15',
        75,
        350
    ) RETURNING id INTO workout1_id;
    
    -- 胸筋ワークアウトのエクササイズ
    INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, rest_seconds, notes) VALUES
    (workout1_id, 'Bench Press', 4, 8, 80.0, NULL, 120, 'Focus on controlled movement'),
    (workout1_id, 'Incline Dumbbell Press', 3, 10, 35.0, NULL, 90, 'Upper chest focus'),
    (workout1_id, 'Push-ups', 3, 15, NULL, NULL, 60, 'Bodyweight finisher'),
    (workout1_id, 'Dumbbell Flyes', 3, 12, 20.0, NULL, 90, 'Stretch and squeeze');
    
    -- サンプルワークアウト2: 背筋トレーニング
    INSERT INTO public.workouts (id, user_id, title, description, date, duration_minutes, calories_burned)
    VALUES (
        uuid_generate_v4(),
        sample_user_id,
        'Back Training Session',
        'Complete back workout targeting lats, rhomboids, and traps',
        '2025-01-16',
        80,
        380
    ) RETURNING id INTO workout2_id;
    
    -- 背筋ワークアウトのエクササイズ
    INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, rest_seconds, notes) VALUES
    (workout2_id, 'Deadlift', 4, 6, 100.0, NULL, 180, 'Maintain proper form'),
    (workout2_id, 'Pull-ups', 4, 8, NULL, NULL, 120, 'Full range of motion'),
    (workout2_id, 'Barbell Rows', 3, 10, 70.0, NULL, 90, 'Squeeze shoulder blades'),
    (workout2_id, 'Lat Pulldowns', 3, 12, 60.0, NULL, 90, 'Control the negative');
    
    -- サンプルワークアウト3: 脚トレーニング
    INSERT INTO public.workouts (id, user_id, title, description, date, duration_minutes, calories_burned)
    VALUES (
        uuid_generate_v4(),
        sample_user_id,
        'Leg Training Session',
        'Intense leg workout focusing on quads, hamstrings, and glutes',
        '2025-01-17',
        90,
        450
    ) RETURNING id INTO workout3_id;
    
    -- 脚ワークアウトのエクササイズ
    INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, rest_seconds, notes) VALUES
    (workout3_id, 'Squats', 4, 10, 90.0, NULL, 150, 'Deep squats, full range'),
    (workout3_id, 'Romanian Deadlifts', 3, 12, 70.0, NULL, 120, 'Hamstring focus'),
    (workout3_id, 'Leg Press', 3, 15, 120.0, NULL, 90, 'High volume'),
    (workout3_id, 'Walking Lunges', 3, 20, 25.0, NULL, 90, '10 per leg'),
    (workout3_id, 'Calf Raises', 4, 20, 40.0, NULL, 60, 'Full contraction');
    
    -- 有酸素トレーニングのサンプル
    INSERT INTO public.workouts (id, user_id, title, description, date, duration_minutes, calories_burned)
    VALUES (
        uuid_generate_v4(),
        sample_user_id,
        'Cardio Session',
        'Mixed cardio workout for endurance',
        '2025-01-18',
        45,
        400
    ) RETURNING id INTO workout1_id;
    
    INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, rest_seconds, notes) VALUES
    (workout1_id, 'Treadmill Running', 1, NULL, NULL, 1800, NULL, 'Steady pace 6 mph'),
    (workout1_id, 'Cycling', 1, NULL, NULL, 900, NULL, 'High intensity intervals'),
    (workout1_id, 'Rowing', 1, NULL, NULL, 600, NULL, 'Cool down pace');
    
    RAISE NOTICE 'Sample workout data inserted successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;

-- データ確認用クエリ
-- SELECT 
--   w.title,
--   w.date,
--   wi.exercise_name,
--   wi.sets,
--   wi.reps,
--   wi.weight_kg,
--   wi.duration_seconds
-- FROM workouts w
-- JOIN workout_items wi ON w.id = wi.workout_id
-- ORDER BY w.date DESC, w.title, wi.exercise_name;