-- MANUAL APPROVAL TEST
-- Use this to test if podcast approval works manually

-- Step 1: Find a pending podcast to test with
SELECT 
    id,
    title,
    submission_status,
    created_at
FROM podcasts 
WHERE submission_status = 'pending'
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Test manual approval (replace the ID with actual podcast ID)
-- Uncomment and modify the following lines to test:
/*
UPDATE podcasts 
SET 
    submission_status = 'approved',
    approved_by = 'your-admin-user-id-here'::uuid,
    updated_at = NOW()
WHERE id = 'podcast-id-from-step-1'::uuid;

-- Check if the update worked
SELECT 
    id,
    title,
    submission_status,
    approved_by,
    updated_at
FROM podcasts 
WHERE id = 'podcast-id-from-step-1'::uuid;
*/

-- Step 3: Check current status of all podcasts
SELECT 
    submission_status,
    COUNT(*) as count
FROM podcasts 
GROUP BY submission_status;

-- Step 4: Check if there are any recent updates
SELECT 
    id,
    title,
    submission_status,
    approved_by,
    updated_at
FROM podcasts 
ORDER BY updated_at DESC 
LIMIT 10;
