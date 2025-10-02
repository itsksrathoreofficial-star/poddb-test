-- Correct Database Functions based on actual schema
-- Run this in Supabase SQL editor

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_contribution_status(UUID, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS get_unread_notification_count(UUID);
DROP FUNCTION IF EXISTS get_pending_podcasts_with_profiles();

-- Create update_contribution_status function
CREATE OR REPLACE FUNCTION update_contribution_status(
    contribution_id BIGINT,
    new_status TEXT,
    reviewer_id UUID DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Update the contribution status
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

-- Create get_pending_podcasts_with_profiles function
CREATE OR REPLACE FUNCTION get_pending_podcasts_with_profiles()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    cover_image_url TEXT,
    total_episodes INTEGER,
    categories TEXT[],
    submission_status TEXT,
    display_name TEXT,
    email TEXT,
    thumbnail_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.cover_image_url,
        p.total_episodes,
        p.categories,
        p.submission_status::TEXT,
        prof.display_name,
        prof.email,
        p.cover_image_url AS thumbnail_url
    FROM podcasts p
    LEFT JOIN auth.users u ON p.submitted_by = u.id
    LEFT JOIN profiles prof ON u.id = prof.user_id
    WHERE p.submission_status = 'pending'
    ORDER BY p.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_contribution_status(BIGINT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_podcasts_with_profiles() TO authenticated;

-- Verify functions were created
SELECT 'All functions created successfully' as status;
