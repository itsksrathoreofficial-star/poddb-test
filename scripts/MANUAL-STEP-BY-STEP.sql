-- MANUAL STEP BY STEP TEST
-- Run each step separately to test

-- STEP 1: Find a contribution to test with
SELECT 
    'STEP 1: Find contribution' as step,
    id,
    target_table,
    target_id,
    status,
    created_at
FROM contributions 
WHERE target_table = 'podcasts'
AND status = 'pending'
ORDER BY created_at DESC 
LIMIT 1;

-- STEP 2: Check the data in that contribution
-- (Replace CONTRIBUTION_ID with actual ID from step 1)
/*
SELECT 
    'STEP 2: Check data' as step,
    id,
    target_id,
    data
FROM contributions 
WHERE id = CONTRIBUTION_ID;
*/

-- STEP 3: Check the current podcast data
-- (Replace PODCAST_ID with actual ID from step 1)
/*
SELECT 
    'STEP 3: Current podcast' as step,
    id,
    title,
    description,
    categories,
    submission_status
FROM podcasts 
WHERE id = 'PODCAST_ID'::uuid;
*/

-- STEP 4: Manual update test
-- (Replace both IDs with actual values)
/*
UPDATE podcasts 
SET 
    title = 'TEST TITLE UPDATE',
    description = 'TEST DESCRIPTION UPDATE',
    updated_at = NOW()
WHERE id = 'PODCAST_ID'::uuid;

SELECT 'STEP 4: Manual update done' as step;
*/

-- STEP 5: Verify the update
-- (Replace PODCAST_ID with actual ID)
/*
SELECT 
    'STEP 5: Verify update' as step,
    id,
    title,
    description,
    updated_at
FROM podcasts 
WHERE id = 'PODCAST_ID'::uuid;
*/
