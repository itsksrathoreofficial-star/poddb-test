-- SIMPLE DEBUG - No complex functions
-- Run this step by step to find the issue

-- Step 1: Basic check - recent contributions
SELECT 
    id,
    target_table,
    target_id,
    status,
    created_at
FROM contributions 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Check if data exists
SELECT 
    id,
    target_table,
    target_id,
    CASE 
        WHEN data IS NULL THEN 'NO DATA'
        ELSE 'HAS DATA'
    END as data_status
FROM contributions 
WHERE target_table = 'podcasts'
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Check specific contribution data
SELECT 
    id,
    target_table,
    target_id,
    data
FROM contributions 
WHERE target_table = 'podcasts'
AND data IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Step 4: Check podcast table
SELECT 
    id,
    title,
    description,
    submission_status,
    updated_at
FROM podcasts 
ORDER BY updated_at DESC 
LIMIT 5;

-- Step 5: Check if any contributions are approved
SELECT 
    COUNT(*) as total_approved
FROM contributions 
WHERE status = 'approved'
AND target_table = 'podcasts';
