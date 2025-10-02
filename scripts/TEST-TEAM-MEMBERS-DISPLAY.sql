-- Test script to check team members display
-- This script will help us understand the current state of team members data

-- 1. Check podcasts with team members
SELECT 
    id,
    title,
    slug,
    team_members,
    CASE 
        WHEN team_members IS NULL THEN 'NULL'
        WHEN team_members = '[]'::jsonb THEN 'Empty Array'
        WHEN team_members = 'null'::jsonb THEN 'Null JSON'
        WHEN jsonb_typeof(team_members) = 'array' THEN 'Array with ' || jsonb_array_length(team_members) || ' items'
        ELSE 'Other: ' || jsonb_typeof(team_members)
    END as team_members_status
FROM podcasts 
WHERE submission_status = 'approved'
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Check if there are any team members in the team_members table (if it exists)
-- Note: This might not exist, so we'll check for it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
        RAISE NOTICE 'team_members table exists';
        -- Show sample data from team_members table
        PERFORM * FROM team_members LIMIT 5;
    ELSE
        RAISE NOTICE 'team_members table does not exist';
    END IF;
END $$;

-- 3. Check podcast_people table (the old way)
SELECT 
    pp.podcast_id,
    p.title as podcast_title,
    pp.person_id,
    pe.full_name as person_name,
    pp.role
FROM podcast_people pp
JOIN podcasts p ON pp.podcast_id = p.id
JOIN people pe ON pp.person_id = pe.id
WHERE p.submission_status = 'approved'
LIMIT 10;

-- 4. Check if any podcasts have team members in the JSONB column
SELECT 
    id,
    title,
    slug,
    jsonb_array_length(team_members) as team_count,
    team_members
FROM podcasts 
WHERE team_members IS NOT NULL 
    AND team_members != '[]'::jsonb
    AND team_members != 'null'::jsonb
    AND jsonb_typeof(team_members) = 'array'
    AND jsonb_array_length(team_members) > 0
ORDER BY updated_at DESC
LIMIT 5;
