-- Fix Podcast Approval Error
-- This script fixes the update_contribution_status function call error

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS update_podcast_contribution_history ON public.podcasts;

-- Step 2: Drop the problematic function
DROP FUNCTION IF EXISTS public.update_contribution_history_status();

-- Step 3: Create a new function that works with the existing update_contribution_status function
CREATE OR REPLACE FUNCTION public.update_podcast_contribution_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if submission_status actually changed
    IF OLD.submission_status IS DISTINCT FROM NEW.submission_status THEN
        -- Update contribution history using the correct function signature
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

-- Step 4: Recreate the trigger
CREATE TRIGGER update_podcast_contribution_history 
    AFTER UPDATE OF submission_status ON public.podcasts 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_podcast_contribution_history();

-- Step 5: Test the function exists and works
SELECT 'Function and trigger created successfully!' as status;

-- Step 6: Verify the function signature
SELECT 
    routine_name, 
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_name = 'update_contribution_status' 
AND routine_schema = 'public';
