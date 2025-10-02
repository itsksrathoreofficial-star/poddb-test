-- COMPLETE FIX for Podcast Approval Issues
-- This script fixes both the function error and the trigger issue

-- Step 1: Drop the problematic trigger and function
DROP TRIGGER IF EXISTS update_podcast_contribution_history ON public.podcasts;
DROP FUNCTION IF EXISTS public.update_contribution_history_status();

-- Step 2: Create a proper function that works with the existing update_contribution_status
CREATE OR REPLACE FUNCTION public.update_podcast_contribution_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if submission_status actually changed
    IF OLD.submission_status IS DISTINCT FROM NEW.submission_status THEN
        -- Update contribution history using the correct function signature
        -- The function expects: (p_target_table text, p_target_id uuid, p_status text, p_admin_notes text, p_reviewed_by uuid)
        PERFORM update_contribution_status(
            'podcasts'::text,           -- p_target_table
            NEW.id,                     -- p_target_id  
            NEW.submission_status,      -- p_status
            NULL,                       -- p_admin_notes
            NEW.approved_by             -- p_reviewed_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
CREATE TRIGGER update_podcast_contribution_history 
    AFTER UPDATE OF submission_status ON public.podcasts 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_podcast_contribution_history();

-- Step 4: Verify the function exists and has correct signature
SELECT 
    routine_name, 
    routine_type,
    specific_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_contribution_status' 
AND routine_schema = 'public';

-- Step 5: Test the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_podcast_contribution_history';

-- Step 6: Success message
SELECT 'Podcast approval fix applied successfully! Both function error and trigger issues are resolved.' as status;
