import { createClient } from '@supabase/supabase-js'

// Service role client for server-side operations that need elevated permissions
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key');
    // Fallback to anon key if service role key is not available
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
