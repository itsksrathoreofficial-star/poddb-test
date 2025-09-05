
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// This must be a server-side only client with the service role key
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getApiKey = async (): Promise<string | undefined> => {
  try {
    // 1. Find active keys with available requests
    const { data: activeKeys, error: fetchError } = await supabaseAdmin
      .from('gemini_api_keys')
      .select('id, api_key')
      .eq('is_active', true)
      .order('requests_used', { ascending: true }) // Use the least used key
      .limit(1);

    if (fetchError) {
      console.error("Genkit: Error fetching Gemini API key:", fetchError);
      return process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Fallback to env var
    }

    if (!activeKeys || activeKeys.length === 0) {
      console.warn("Genkit: No active Gemini API keys found in the database. Falling back to environment variable.");
      return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    const selectedKey = activeKeys[0];

    // 2. Increment its usage count (fire and forget)
    supabaseAdmin
      .rpc('increment_gemini_requests_used', { key_id: selectedKey.id })
      .then(({ error: rpcError }) => {
        if (rpcError) {
          console.error(`Genkit: Failed to increment request count for key ${selectedKey.id}:`, rpcError);
        }
      });
      
    // 3. Return the key
    return selectedKey.api_key;

  } catch (error) {
    console.error("Genkit: A critical error occurred in getApiKey function:", error);
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Fallback
  }
};


// Do not export ai directly. We will create an async getter.
let ai: any;

// This async function initializes Genkit with a resolved API key.
// This is the correct way to handle async dependencies for initialization.
async function initializeGenkit() {
    if (ai) return ai;

    const apiKey = await getApiKey();

    ai = genkit({
      plugins: [
        googleAI({ apiKey }), // Pass the resolved API key string here
      ],
      // enableTracingAndMetrics: true, // Not available in this version
    });
    return ai;
}

// Export a getter function that flows will use.
export async function getAi() {
    if (!ai) {
        await initializeGenkit();
    }
    return ai;
}
