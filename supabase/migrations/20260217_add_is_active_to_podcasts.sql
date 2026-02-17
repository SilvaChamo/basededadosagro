-- Add is_active column to podcasts table
ALTER TABLE public.podcasts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing records to be active by default if they were created before this column
UPDATE public.podcasts SET is_active = TRUE WHERE is_active IS NULL;
