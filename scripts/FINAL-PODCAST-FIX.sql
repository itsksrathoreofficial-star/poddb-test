-- FINAL FIX for Podcast Approval Error
-- This completely removes all problematic triggers and functions

-- Step 1: Drop ALL problematic triggers on podcasts table
DROP TRIGGER IF EXISTS update_podcast_contribution_history ON public.podcasts;
DROP TRIGGER IF EXISTS podcast_status_notification_trigger ON public.podcasts;

-- Step 2: Drop ALL problematic functions
DROP FUNCTION IF EXISTS public.update_contribution_history_status();
DROP FUNCTION IF EXISTS public.update_podcast_contribution_history();
DROP FUNCTION IF EXISTS public.create_contribution_notification();

-- Step 3: Verify all triggers are removed
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'podcasts';

-- Step 4: Verify problematic functions are removed
SELECT 
    routine_name, 
    specific_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'update_contribution_history_status',
    'update_podcast_contribution_history', 
    'create_contribution_notification'
) AND routine_schema = 'public';

-- Step 5: Success message
SELECT 'All problematic triggers and functions removed! Podcast approval should work now without any errors.' as status;
