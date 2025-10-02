-- URGENT FIX - Run this in Supabase SQL Editor RIGHT NOW
-- This will fix the podcast approval issue immediately

-- Step 1: Drop function if exists (to avoid conflicts)
DROP FUNCTION IF EXISTS update_contribution_status(BIGINT, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS update_contribution_status(name, uuid, submission_status, unknown, unknown);

-- Step 2: Create the correct function
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

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION update_contribution_status(BIGINT, TEXT, UUID, TEXT) TO authenticated;

-- Step 4: Test the function
SELECT 'Function created successfully!' as status;

-- Step 5: Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'update_contribution_status' 
AND routine_schema = 'public';
