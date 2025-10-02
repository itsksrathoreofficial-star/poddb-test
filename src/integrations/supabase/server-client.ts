// Client-safe server functions for static export compatibility
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Client-safe supabase instance
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Client-safe server function that works in both environments
export const supabaseServer = async () => {
  // For client-side usage, return the regular client
  if (typeof window !== 'undefined') {
    return supabaseClient;
  }
  
  // For server-side usage in non-static environments
  try {
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    
    const cookieStore = await cookies();
    
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in static context
          }
        },
      },
    });
  } catch (error) {
    // Fallback to regular client if server components are not available
    return supabaseClient;
  }
};

// Export createClient for direct usage
export { createClient };

// Export supabase instance for direct usage
export const supabase = supabaseClient;
