-- TEST SCRIPT for Podcast Approval Fix
-- Run this after applying the comprehensive fix

-- Step 1: Check if any triggers exist on podcasts table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'podcasts';

-- Step 2: Check if create_notification function exists and works
SELECT 
    routine_name, 
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_name = 'create_notification' 
AND routine_schema = 'public';

-- Step 3: Test the create_notification function (this will create a test notification)
-- Note: Replace '00000000-0000-0000-0000-000000000000' with a real user ID for testing
/*
SELECT create_notification(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Test Notification',
    'This is a test notification to verify the function works',
    'system',
    '{"test": true}'::JSONB
);
*/

-- Step 4: Check recent notifications to see if any were created
SELECT 
    id,
    user_id,
    title,
    message,
    type,
    created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 5: Success message
SELECT 'Test completed! If no triggers exist on podcasts table and create_notification function exists, the fix is working.' as status;
