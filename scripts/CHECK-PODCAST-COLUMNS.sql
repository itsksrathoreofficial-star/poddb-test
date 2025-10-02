-- CHECK PODCAST COLUMNS
-- This script checks what columns exist in podcasts table

-- Step 1: Check all columns in podcasts table
SELECT 
    'PODCASTS TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'podcasts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if specific columns exist
SELECT 
    'COLUMN EXISTENCE CHECK' as section,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcasts' 
        AND column_name = 'platform_links'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as platform_links,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcasts' 
        AND column_name = 'social_links'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as social_links,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcasts' 
        AND column_name = 'official_website'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as official_website,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcasts' 
        AND column_name = 'team_members'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as team_members,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcasts' 
        AND column_name = 'episodes'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as episodes;

-- Step 3: Check recent contributions data
SELECT 
    'CONTRIBUTION DATA SAMPLE' as section,
    id,
    target_id,
    jsonb_object_keys(data) as available_keys
FROM contributions 
WHERE target_table = 'podcasts'
AND data IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Step 4: Success message
SELECT 'Column check complete! Use this info to update the fix script.' as status;
