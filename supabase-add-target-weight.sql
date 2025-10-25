-- Add target_weight_kg column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2);

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.target_weight_kg IS 'Target weight in kilograms for the user''s fitness goal';
