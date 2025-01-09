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
    const { videoId, title, artist } = await req.json()

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'No video ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if track already exists
    const { data: existingTrack } = await supabase
      .from('stored_tracks')
      .select('*')
      .eq('track_id', videoId)
      .single()

    if (existingTrack) {
      // Update last_accessed timestamp
      await supabase
        .from('stored_tracks')
        .update({ last_accessed: new Date().toISOString() })
        .eq('track_id', videoId)

      return new Response(
        JSON.stringify({ 
          message: 'Track already exists',
          track: existingTrack 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use yt-dlp to download audio
    const process = new Deno.Command('yt-dlp', {
      args: [
        `https://www.youtube.com/watch?v=${videoId}`,
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', '-'  // Output to stdout
      ],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { stdout, stderr } = await process.output();

    if (stderr.length > 0) {
      console.error(new TextDecoder().decode(stderr));
      throw new Error('Failed to download audio');
    }

    // Upload to Supabase Storage
    const filePath = `${videoId}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, stdout, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create track metadata
    const { data: track, error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: videoId,
        file_path: filePath,
        title,
        artist,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return new Response(
      JSON.stringify({
        message: 'Track downloaded and stored successfully',
        track
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})