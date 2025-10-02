-- Add a simple notification function that doesn't cause issues
-- Run this AFTER running FINAL-PODCAST-FIX.sql

-- Create a simple notification function
CREATE OR REPLACE FUNCTION public.create_simple_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Just return NEW without doing anything complex
    -- This prevents errors while still allowing the trigger to exist
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple trigger for notifications (optional)
CREATE TRIGGER simple_podcast_notification_trigger 
    AFTER UPDATE OF submission_status ON public.podcasts 
    FOR EACH ROW 
    EXECUTE FUNCTION public.create_simple_notification();

-- Success message
SELECT 'Simple notification function added successfully!' as status;
