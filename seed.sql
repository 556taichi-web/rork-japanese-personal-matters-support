-- Seed data for AI Personal Training App
-- This file should be run after schema.sql
-- Note: In production, users are created through Supabase Auth, and profiles are auto-created via trigger

-- Insert sample profiles for testing (these would normally be created via auth trigger)
INSERT INTO public.profiles (id, email, full_name, age, gender, height_cm, weight_kg, activity_level, fitness_goal) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'yuki@example.com', '田中 由紀', 28, 'female', 160, 58.5, 'lightly_active', 'lose_weight'),
('550e8400-e29b-41d4-a716-446655440002', 'takeshi@example.com', '佐藤 武', 32, 'male', 175, 72.0, 'moderately_active', 'build_muscle'),
('550e8400-e29b-41d4-a716-446655440003', 'akiko@example.com', '山田 明子', 25, 'female', 165, 55.0, 'very_active', 'improve_endurance')
ON CONFLICT (id) DO NOTHING;

-- Sample workouts with Japanese content
INSERT INTO public.workouts (id, user_id, title, description, date, duration_minutes, calories_burned, ai_feedback) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '朝のヨガセッション', '基本的なヨガポーズで体をほぐしました', '2024-01-15', 30, 120, 'とても良いフォームでした！呼吸を意識してさらに効果を高めましょう。'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'ウォーキング', '近所を30分散歩', '2024-01-16', 30, 150, '良いペースで歩けています。明日は少し距離を伸ばしてみましょう。'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '筋トレ（上半身）', 'ベンチプレス、プルアップ、ショルダープレス', '2024-01-15', 45, 280, '重量設定が適切です。次回はレップ数を1-2回増やしてみましょう。'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'ランニング', '5km ジョギング', '2024-01-16', 25, 320, 'ペースが安定しています。心拍数を意識してトレーニング効果を最大化しましょう。'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'HIIT トレーニング', '高強度インターバルトレーニング', '2024-01-15', 20, 250, '素晴らしい強度でした！回復時間をしっかり取って継続しましょう。')
ON CONFLICT (id) DO NOTHING;

-- Sample workout items
INSERT INTO public.workout_items (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, notes) VALUES
-- Yoga session items
('660e8400-e29b-41d4-a716-446655440001', '太陽礼拝', NULL, NULL, NULL, 600, '呼吸に合わせてゆっくりと'),
('660e8400-e29b-41d4-a716-446655440001', '戦士のポーズ', NULL, NULL, NULL, 300, '左右各30秒キープ'),
('660e8400-e29b-41d4-a716-446655440001', '子供のポーズ', NULL, NULL, NULL, 180, 'リラックス'),

-- Upper body workout items
('660e8400-e29b-41d4-a716-446655440003', 'ベンチプレス', 3, 10, 60.0, NULL, '胸をしっかり張って'),
('660e8400-e29b-41d4-a716-446655440003', 'プルアップ', 3, 8, NULL, NULL, '肩甲骨を寄せる意識'),
('660e8400-e29b-41d4-a716-446655440003', 'ショルダープレス', 3, 12, 20.0, NULL, 'ダンベル使用'),

-- HIIT workout items
('660e8400-e29b-41d4-a716-446655440005', 'バーピー', 4, 10, NULL, NULL, '30秒休憩'),
('660e8400-e29b-41d4-a716-446655440005', 'マウンテンクライマー', 4, 20, NULL, NULL, '各脚10回'),
('660e8400-e29b-41d4-a716-446655440005', 'ジャンピングジャック', 4, 15, NULL, NULL, '全身を使って')
ON CONFLICT (id) DO NOTHING;

-- Sample nutrition targets
INSERT INTO public.nutrition_targets (user_id, date, target_calories, target_protein_g, target_carbs_g, target_fat_g, target_fiber_g) VALUES
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 1800, 90, 200, 60, 25),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-16', 1800, 90, 200, 60, 25),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-15', 2200, 120, 250, 80, 30),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-16', 2200, 120, 250, 80, 30),
('550e8400-e29b-41d4-a716-446655440003', '2024-01-15', 2000, 100, 220, 70, 28)
ON CONFLICT (user_id, date) DO NOTHING;

-- Sample nutrition logs with Japanese food items
INSERT INTO public.nutrition_logs (user_id, date, meal_type, food_name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, ai_analysis) VALUES
-- User 1 meals (weight loss focused)
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'breakfast', 'オートミール', 50, 'g', 190, 6.5, 32, 3.5, 5, 'バランスの良い朝食です。フルーツを追加するとさらに栄養価が高まります。'),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'breakfast', 'バナナ', 1, '本', 105, 1.3, 27, 0.4, 3.1, NULL),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'lunch', 'サラダボウル', 1, '皿', 350, 15, 25, 20, 8, '野菜たっぷりで素晴らしいです。タンパク質も十分摂取できています。'),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'dinner', '鮭の塩焼き', 100, 'g', 230, 25, 0, 14, 0, '良質なタンパク質と脂質が摂取できています。'),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'dinner', '玄米', 150, 'g', 165, 3, 35, 1, 2, NULL),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'snack', 'ヨーグルト', 100, 'g', 60, 3.5, 5, 3, 0, 'プロテインとカルシウムが豊富です。'),

-- User 2 meals (muscle building focused)
('550e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'breakfast', 'プロテインスムージー', 1, '杯', 280, 25, 30, 8, 5, '筋トレ後の栄養補給に最適です。'),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'lunch', '鶏胸肉サラダ', 1, '皿', 420, 35, 15, 18, 6, 'タンパク質が豊富で筋肉づくりに効果的です。'),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'dinner', 'ステーキ', 150, 'g', 450, 40, 0, 28, 0, '高タンパクですが、脂質も多めです。野菜と一緒に摂取しましょう。'),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'dinner', 'ブロッコリー', 100, 'g', 25, 3, 4, 0.3, 3, NULL),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'snack', 'アーモンド', 30, 'g', 175, 6, 6, 15, 4, '良質な脂質とビタミンEが豊富です。'),

-- User 3 meals (endurance focused)
('550e8400-e29b-41d4-a716-446655440003', '2024-01-15', 'breakfast', '和定食', 1, '膳', 450, 20, 65, 12, 6, '炭水化物とタンパク質のバランスが良好です。'),
('550e8400-e29b-41d4-a716-446655440003', '2024-01-15', 'lunch', 'パスタ', 1, '皿', 380, 12, 70, 8, 4, '持久力向上に必要な炭水化物が豊富です。'),
('550e8400-e29b-41d4-a716-446655440003', '2024-01-15', 'dinner', '魚の煮付け', 1, '切れ', 200, 22, 8, 6, 2, 'タンパク質と必要な脂質が摂取できています。')
ON CONFLICT (id) DO NOTHING;

-- Sample summaries with Japanese AI recommendations
INSERT INTO public.summaries (user_id, summary_type, date, content, ai_recommendations) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'daily', '2024-01-15', 
'{
  "total_calories_consumed": 1100,
  "total_calories_burned": 120,
  "net_calories": 980,
  "protein_intake": 54.3,
  "carbs_intake": 124,
  "fat_intake": 41.9,
  "fiber_intake": 18.1,
  "workouts_completed": 1,
  "workout_duration": 30
}', 
'今日は良いスタートです！カロリー摂取量が目標より少し低めなので、夕食後に軽いスナックを追加することをお勧めします。ヨガも素晴らしいです。明日は少し強度を上げてみましょう。'),

('550e8400-e29b-41d4-a716-446655440002', 'daily', '2024-01-15',
'{
  "total_calories_consumed": 1350,
  "total_calories_burned": 280,
  "net_calories": 1070,
  "protein_intake": 109,
  "carbs_intake": 55,
  "fat_intake": 69.3,
  "fiber_intake": 18,
  "workouts_completed": 1,
  "workout_duration": 45
}',
'素晴らしいトレーニングでした！タンパク質摂取量が目標に近く、筋肉づくりに効果的です。炭水化物をもう少し増やして、エネルギー補給を強化しましょう。'),

('550e8400-e29b-41d4-a716-446655440003', 'daily', '2024-01-15',
'{
  "total_calories_consumed": 1030,
  "total_calories_burned": 250,
  "net_calories": 780,
  "protein_intake": 54,
  "carbs_intake": 143,
  "fat_intake": 26,
  "fiber_intake": 12,
  "workouts_completed": 1,
  "workout_duration": 20
}',
'HIITトレーニング、お疲れ様でした！持久力向上には炭水化物の摂取が重要です。今日の摂取量は適切ですが、トレーニング前後の補給も意識してみましょう。'),

('550e8400-e29b-41d4-a716-446655440001', 'weekly', '2024-01-15',
'{
  "average_daily_calories": 1200,
  "total_workouts": 5,
  "total_workout_time": 180,
  "weight_change": -0.5,
  "consistency_score": 85
}',
'この週は一貫してトレーニングを続けられました！体重も健康的に減少しています。来週は運動強度を少し上げて、筋力トレーニングも取り入れてみましょう。')
ON CONFLICT (user_id, summary_type, date) DO NOTHING;

-- Note: In production, you would:
-- 1. Create users through Supabase Auth (supabase.auth.signUp)
-- 2. Profiles are automatically created via the trigger
-- 3. Insert workout and nutrition data with real user IDs from auth.users