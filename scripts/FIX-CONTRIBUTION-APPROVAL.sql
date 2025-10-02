-- FIX CONTRIBUTION APPROVAL ISSUE
-- This script fixes the missing contribution_type column issue

-- Step 1: Check if contributions table has the required columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add contribution_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributions' 
        AND column_name = 'contribution_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.contributions ADD COLUMN contribution_type text DEFAULT 'general';
        RAISE NOTICE 'Added contribution_type column';
    ELSE
        RAISE NOTICE 'contribution_type column already exists';
    END IF;
    
    -- Add target_title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributions' 
        AND column_name = 'target_title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.contributions ADD COLUMN target_title text;
        RAISE NOTICE 'Added target_title column';
    ELSE
        RAISE NOTICE 'target_title column already exists';
    END IF;
END $$;

-- Step 3: Update existing contributions to have proper contribution_type
UPDATE public.contributions 
SET contribution_type = CASE 
    WHEN target_table = 'podcasts' THEN 'podcast'
    WHEN target_table = 'episodes' THEN 'episode'
    WHEN target_table = 'people' THEN 'person'
    ELSE 'general'
END
WHERE contribution_type IS NULL OR contribution_type = 'general';

-- Step 4: Update target_title from data column if it's missing
UPDATE public.contributions 
SET target_title = COALESCE(
    (data->>'title')::text,
    (data->>'name')::text,
    'Untitled'
)
WHERE target_title IS NULL OR target_title = '';

-- Step 5: Verify the fixes
SELECT 
    'contribution_type' as column_name,
    COUNT(*) as total_rows,
    COUNT(contribution_type) as non_null_values
FROM contributions
UNION ALL
SELECT 
    'target_title' as column_name,
    COUNT(*) as total_rows,
    COUNT(target_title) as non_null_values
FROM contributions;

-- Step 6: Check recent contributions
SELECT 
    id,
    target_table,
    contribution_type,
    target_title,
    status,
    created_at
FROM contributions 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 7: Success message
SELECT 'Contribution approval fix applied! Missing columns added and populated.' as status;
