-- Verify Database Functions
-- Run this in Supabase SQL editor to check if functions exist

-- Test update_contribution_status function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_contribution_status') 
        THEN '✅ update_contribution_status function exists'
        ELSE '❌ update_contribution_status function missing'
    END as status;

-- Test create_notification function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification') 
        THEN '✅ create_notification function exists'
        ELSE '❌ create_notification function missing'
    END as status;

-- Test get_user_profile function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_profile') 
        THEN '✅ get_user_profile function exists'
        ELSE '❌ get_user_profile function missing'
    END as status;

-- Test get_unread_notification_count function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_unread_notification_count') 
        THEN '✅ get_unread_notification_count function exists'
        ELSE '❌ get_unread_notification_count function missing'
    END as status;

-- Test get_pending_podcasts_with_profiles function
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_pending_podcasts_with_profiles') 
        THEN '✅ get_pending_podcasts_with_profiles function exists'
        ELSE '❌ get_pending_podcasts_with_profiles function missing'
    END as status;

-- Show all functions
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN (
    'update_contribution_status', 
    'create_notification', 
    'get_user_profile', 
    'get_unread_notification_count',
    'get_pending_podcasts_with_profiles'
)
ORDER BY proname;
