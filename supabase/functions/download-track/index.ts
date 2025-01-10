import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { download } from "https://deno.land/x/ytdl_core/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trackTitle, trackArtist, trackId } = await req.json()
    console.log(`Downloading track: ${trackTitle} by ${trackArtist}`)

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
      console.log('Track already exists, returning existing file path')
      return new Response(
        JSON.stringify({ filePath: existingTrack.file_path }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Search YouTube for the track
    const searchQuery = `${trackTitle} ${trackArtist} official audio`
    const videoUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ` // This is a placeholder. In production, you'd search YouTube first

    // Download the audio using yt-dlp
    const audioBuffer = await download(videoUrl, {
      format: 'mp3',
      quality: 'highest',
    })

    // Generate a unique filename
    const fileName = `${crypto.randomUUID()}.mp3`
    const filePath = `tracks/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Store track information in the database
    const { error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: trackId,
        file_path: filePath,
        title: trackTitle,
        artist: trackArtist
      })

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({ filePath }),
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