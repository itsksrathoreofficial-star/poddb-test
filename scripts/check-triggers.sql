-- Check if there are any triggers that might call update_contribution_status
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (action_statement LIKE '%update_contribution_status%' 
     OR trigger_name LIKE '%contribution%');

-- Check if there are any other functions that might call update_contribution_status
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition LIKE '%update_contribution_status%';
