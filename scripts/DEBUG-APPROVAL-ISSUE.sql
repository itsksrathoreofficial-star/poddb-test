-- DEBUG SCRIPT for Podcast Approval Issue
-- Run this to check what's preventing approval

-- Step 1: Check if any triggers still exist on podcasts table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'podcasts';

-- Step 2: Check if any problematic functions still exist
SELECT 
    routine_name, 
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_name IN (
    'update_contribution_history_status',
    'update_podcast_contribution_history', 
    'create_contribution_notification',
    'podcast_approval_notification'
) AND routine_schema = 'public';

-- Step 3: Check the structure of podcasts table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'podcasts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check recent podcast submissions and their status
SELECT 
    id,
    title,
    submission_status,
    approved_by,
    created_at,
    updated_at
FROM podcasts 
WHERE submission_status = 'pending'
ORDER BY created_at DESC 
LIMIT 10;

-- Step 5: Check if there are any constraints or rules on submission_status
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.podcasts'::regclass;

-- Step 6: Check if there are any RLS policies that might be blocking updates
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'podcasts';

-- Step 7: Test if we can manually update a podcast status
-- (This will show if there are any permission issues)
SELECT 'Ready to test manual update' as status;
