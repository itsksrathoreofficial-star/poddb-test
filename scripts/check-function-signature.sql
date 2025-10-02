-- Check the exact signature of update_contribution_status function
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition,
    specific_name
FROM information_schema.routines 
WHERE routine_name = 'update_contribution_status' 
AND routine_schema = 'public';

-- Check function parameters
SELECT 
    p.specific_name,
    p.parameter_name,
    p.data_type,
    p.parameter_mode,
    p.ordinal_position
FROM information_schema.parameters p
WHERE p.specific_schema = 'public'
AND p.specific_name IN (
    SELECT specific_name 
    FROM information_schema.routines 
    WHERE routine_name = 'update_contribution_status' 
    AND routine_schema = 'public'
)
ORDER BY p.ordinal_position;

-- Check if there are multiple versions of the function
SELECT 
    routine_name,
    specific_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%update_contribution_status%' 
AND routine_schema = 'public';
