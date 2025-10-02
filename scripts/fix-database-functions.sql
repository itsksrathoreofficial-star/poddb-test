-- Fix database functions - Run this in Supabase SQL editor
-- This script will drop existing functions and recreate them with correct signatures

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS update_contribution_status(UUID, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS update_contribution_status(UUID, TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_pending_podcasts_with_profiles();
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS get_unread_notification_count(UUID);

-- Create update_contribution_status function
CREATE OR REPLACE FUNCTION update_contribution_status(
    contribution_id UUID,
    new_status TEXT,
    reviewer_id UUID DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Update the contribution status
    UPDATE contributions 
    SET 
        status = new_status,
        reviewed_by = CASE WHEN new_status IN ('approved', 'rejected') THEN reviewer_id ELSE reviewed_by END,
        reviewed_at = CASE WHEN new_status IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END,
        rejection_reason = CASE WHEN new_status = 'rejected' THEN rejection_reason ELSE NULL END
    WHERE id = contribution_id;
    
    -- If approved, apply changes to target table
    IF new_status = 'approved' THEN
        -- This will be handled by the application code for now
        -- as dynamic SQL in functions can be complex
        NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification function
CREATE OR REPLACE FUNCTION create_notification(
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

-- Create get_pending_podcasts_with_profiles function
CREATE OR REPLACE FUNCTION get_pending_podcasts_with_profiles()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ,
    user_id UUID,
    user_name TEXT,
    user_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.cover_image_url,
        p.created_at,
        p.user_id,
        pr.full_name as user_name,
        au.email as user_email
    FROM podcasts p
    LEFT JOIN profiles pr ON p.user_id = pr.user_id
    LEFT JOIN auth.users au ON p.user_id = au.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_user_profile function
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    bio TEXT,
    photo_url TEXT,
    social_links JSONB,
    is_verified BOOLEAN,
    role TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.full_name,
        p.bio,
        p.photo_url,
        p.social_links,
        p.is_verified,
        p.role,
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_contribution_status(UUID, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_podcasts_with_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

-- Verify functions were created successfully
SELECT 'Functions created successfully' as status;
