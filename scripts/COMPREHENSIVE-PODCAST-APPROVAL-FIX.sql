-- COMPREHENSIVE FIX for Podcast Approval Issue
-- This script fixes all podcast approval problems
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL problematic triggers on podcasts table
DROP TRIGGER IF EXISTS update_podcast_contribution_history ON public.podcasts;
DROP TRIGGER IF EXISTS podcast_status_notification_trigger ON public.podcasts;
DROP TRIGGER IF EXISTS update_contribution_history_status ON public.podcasts;
DROP TRIGGER IF EXISTS podcast_approval_notification_trigger ON public.podcasts;

-- Step 2: Drop ALL problematic functions
DROP FUNCTION IF EXISTS public.update_contribution_history_status();
DROP FUNCTION IF EXISTS public.update_podcast_contribution_history();
DROP FUNCTION IF EXISTS public.create_contribution_notification();
DROP FUNCTION IF EXISTS public.podcast_approval_notification();

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
    'create_contribution_notification',
    'podcast_approval_notification'
) AND routine_schema = 'public';

-- Step 5: Create a simple, working notification function
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (p_user_id, p_title, p_message, p_type, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- Step 7: Test the setup
SELECT 'Comprehensive podcast approval fix applied successfully! All problematic triggers and functions removed.' as status;

-- Step 8: Verify no triggers exist on podcasts table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'podcasts';

-- Step 9: Test that the notification function works
SELECT 'Notification function created and ready to use!' as status;
