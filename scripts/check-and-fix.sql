-- Check and Fix Database Functions
-- Run this in Supabase SQL editor

-- First, check what functions exist
SELECT 'Checking existing functions...' as status;

-- Check if update_contribution_status function exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_contribution_status') 
        THEN '✅ update_contribution_status function exists'
        ELSE '❌ update_contribution_status function missing'
    END as status;

-- If function doesn't exist, create it
-- Create update_contribution_status function
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

-- Create create_notification function
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'system',
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

-- Create get_user_profile function
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    social_links JSONB,
    role TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.display_name,
        p.bio,
        p.avatar_url,
        p.social_links,
        p.role::TEXT,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_unread_notification_count function
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO unread_count
    FROM notifications
    WHERE user_id = p_user_id AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_contribution_status(BIGINT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

-- Verify functions were created
SELECT 'All functions created successfully!' as status;

-- Test the function
SELECT 'Testing update_contribution_status function...' as status;
