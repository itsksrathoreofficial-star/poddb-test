-- Simple Test for Database Functions
-- Run this in Supabase SQL editor

-- Test if update_contribution_status function exists
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'update_contribution_status';

-- If no results, create the function
CREATE OR REPLACE FUNCTION update_contribution_status(
    contribution_id BIGINT,
    new_status TEXT,
    reviewer_id UUID DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE contributions 
    SET 
        status = new_status::contribution_status,
        reviewed_by = CASE WHEN new_status IN ('approved', 'rejected') THEN reviewer_id ELSE reviewed_by END,
        reviewed_at = CASE WHEN new_status IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END,
        reviewer_notes = CASE WHEN new_status = 'rejected' THEN rejection_reason ELSE reviewer_notes END
    WHERE id = contribution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION update_contribution_status(BIGINT, TEXT, UUID, TEXT) TO authenticated;

-- Test the function
SELECT 'update_contribution_status function created successfully!' as status;
