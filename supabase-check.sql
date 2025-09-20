-- Supabaseデータベースの現在の状態を確認するためのクエリ

-- 1. テーブルの存在確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'workouts', 'workout_items', 'nutrition_logs', 'nutrition_targets');

-- 2. workoutsテーブルの構造確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workouts'
ORDER BY ordinal_position;

-- 3. workout_itemsテーブルの構造確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workout_items'
ORDER BY ordinal_position;

-- 4. RLSポリシーの確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('workouts', 'workout_items');

-- 5. 現在のユーザーのプロファイル確認（テスト用）
-- SELECT * FROM profiles LIMIT 1;

-- 6. 現在のワークアウトデータ確認（テスト用）
-- SELECT * FROM workouts LIMIT 5;