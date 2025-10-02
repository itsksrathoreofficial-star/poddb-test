-- Test if database functions exist
-- Run this in Supabase SQL editor to check

-- Check if update_contribution_status function exists
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'update_contribution_status';

-- Check if get_pending_podcasts_with_profiles function exists
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'get_pending_podcasts_with_profiles';

-- Check if create_notification function exists
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'create_notification';

-- Check if get_user_profile function exists
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'get_user_profile';

-- Check if get_unread_notification_count function exists
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'get_unread_notification_count';
