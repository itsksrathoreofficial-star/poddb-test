import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all pending scheduled reviews that are due
    const { data: scheduledReviews, error: fetchError } = await supabaseClient
      .from('scheduled_reviews')
      .select(`
        *,
        fake_user:fake_users(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_date', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled reviews:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch scheduled reviews' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!scheduledReviews || scheduledReviews.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No scheduled reviews to process',
          processed: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let processedCount = 0
    const errors: string[] = []

    // Process each scheduled review
    for (const review of scheduledReviews) {
      try {
        // Call the post_scheduled_review function
        const { data: success, error: postError } = await supabaseClient.rpc('post_scheduled_review', {
          review_id: review.id
        })

        if (postError) {
          console.error(`Error posting review ${review.id}:`, postError)
          errors.push(`Review ${review.id}: ${postError.message}`)
        } else if (success) {
          processedCount++
          console.log(`Successfully posted review ${review.id}`)
        } else {
          console.error(`Failed to post review ${review.id}: Function returned false`)
          errors.push(`Review ${review.id}: Function returned false`)
        }
      } catch (error) {
        console.error(`Exception processing review ${review.id}:`, error)
        errors.push(`Review ${review.id}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${processedCount} reviews`,
        processed: processedCount,
        total: scheduledReviews.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
