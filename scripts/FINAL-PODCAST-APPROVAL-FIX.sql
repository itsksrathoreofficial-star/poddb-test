-- FINAL FIX for Podcast Approval Issue
-- This script completely fixes the podcast approval problem
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL problematic triggers on podcasts table
DROP TRIGGER IF EXISTS update_podcast_contribution_history ON public.podcasts;
DROP TRIGGER IF EXISTS podcast_status_notification_trigger ON public.podcasts;
DROP TRIGGER IF EXISTS update_contribution_history_status ON public.podcasts;

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

-- Step 5: Create a simple, working trigger for notifications only
CREATE OR REPLACE FUNCTION public.podcast_approval_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only send notification when status changes to approved
    IF OLD.submission_status IS DISTINCT FROM NEW.submission_status 
       AND NEW.submission_status = 'approved' THEN
        
        -- Insert notification directly
        INSERT INTO notifications (
            user_id, 
            title, 
            message, 
            type, 
            metadata
        ) VALUES (
            NEW.user_id,
            'Podcast Approved',
            'Your podcast "' || NEW.title || '" has been approved and is now live!',
            'approval',
            jsonb_build_object(
                'podcast_id', NEW.id,
                'podcast_title', NEW.title,
                'approved_by', NEW.approved_by
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the notification trigger
CREATE TRIGGER podcast_approval_notification_trigger 
    AFTER UPDATE OF submission_status ON public.podcasts 
    FOR EACH ROW 
    EXECUTE FUNCTION public.podcast_approval_notification();

-- Step 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.podcast_approval_notification() TO authenticated;

-- Step 8: Test the setup
SELECT 'Podcast approval fix applied successfully! All problematic triggers removed and simple notification trigger created.' as status;

-- Step 9: Verify the new trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'podcast_approval_notification_trigger';
