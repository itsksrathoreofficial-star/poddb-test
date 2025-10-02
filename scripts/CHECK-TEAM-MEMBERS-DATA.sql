-- Check team members data in podcasts table
SELECT 
    id,
    title,
    team_members,
    jsonb_array_length(team_members) as team_count
FROM podcasts 
WHERE team_members IS NOT NULL 
    AND team_members != '[]'::jsonb
    AND team_members != 'null'::jsonb
ORDER BY updated_at DESC
LIMIT 10;
