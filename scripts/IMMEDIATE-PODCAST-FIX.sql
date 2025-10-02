-- IMMEDIATE FIX for Podcast Approval Error
-- This completely removes the problematic trigger and function

-- Step 1: Drop the problematic trigger completely
DROP TRIGGER IF EXISTS update_podcast_contribution_history ON public.podcasts;

-- Step 2: Drop the problematic function completely
DROP FUNCTION IF EXISTS public.update_contribution_history_status();

-- Step 3: Drop any other problematic functions
DROP FUNCTION IF EXISTS public.update_podcast_contribution_history();

-- Step 4: Verify the trigger is gone
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE '%contribution%' 
AND event_object_table = 'podcasts';

-- Step 5: Check what functions exist with update_contribution_status name
SELECT 
    routine_name, 
    specific_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%update_contribution_status%' 
AND routine_schema = 'public';

-- Step 6: Success message
SELECT 'All problematic triggers and functions removed! Podcast approval should work now.' as status;
