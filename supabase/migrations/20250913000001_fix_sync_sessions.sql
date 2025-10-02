-- Fix sync_sessions table by adding missing sync_type column
ALTER TABLE public.sync_sessions 
ADD COLUMN IF NOT EXISTS sync_type text DEFAULT 'manual';

-- Update constraint to include sync_type
ALTER TABLE public.sync_sessions 
DROP CONSTRAINT IF EXISTS sync_sessions_session_type_check;

ALTER TABLE public.sync_sessions 
ADD CONSTRAINT sync_sessions_session_type_check 
CHECK (session_type = ANY (ARRAY['manual'::text, 'automatic'::text, 'scheduled'::text, 'ultra_powerful'::text]));

-- Add comment
COMMENT ON COLUMN public.sync_sessions.sync_type IS 'Type of sync operation performed';
