-- CHECK CONTRIBUTIONS TABLE STRUCTURE
-- Run this to see what columns exist in contributions table

-- Step 1: Check contributions table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if contribution_type column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'contributions' 
            AND column_name = 'contribution_type'
            AND table_schema = 'public'
        ) THEN 'contribution_type column EXISTS'
        ELSE 'contribution_type column MISSING'
    END as column_status;

-- Step 3: Check recent contributions
SELECT 
    id,
    target_table,
    target_id,
    status,
    created_at
FROM contributions 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Check what columns are actually being selected in the code
-- (This will help us understand what the code expects vs what exists)
SELECT 'Check the admin.ts file for the exact SELECT query being used' as note;
