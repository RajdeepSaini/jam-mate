import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trackId, title, artist, duration } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if track already exists
    const { data: existingTrack } = await supabase
      .from('stored_tracks')
      .select('*')
      .eq('track_id', trackId)
      .single()

    if (existingTrack) {
      // Update last_accessed timestamp
      await supabase
        .from('stored_tracks')
        .update({ last_accessed: new Date().toISOString() })
        .eq('track_id', trackId)

      return new Response(
        JSON.stringify({ 
          message: 'Track already exists',
          track: existingTrack 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate file path for new track
    const filePath = `${trackId}.mp3`

    // Insert track metadata
    const { data: newTrack, error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: trackId,
        file_path: filePath,
        title,
        artist,
        duration
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({
        message: 'Track metadata created successfully',
        track: newTrack,
        uploadUrl: filePath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})