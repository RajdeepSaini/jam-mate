import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { download } from "https://deno.land/x/youtube_dl@v0.2.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('Function invoked:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Parse request body
    const { trackTitle, trackArtist, trackId } = await req.json();
    console.log(`Processing track request: ${trackTitle} by ${trackArtist}`);

    if (!trackTitle || !trackArtist || !trackId) {
      throw new Error('Missing required track information');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required configuration');
      throw new Error('Missing required configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if track already exists
    console.log('Checking if track exists:', trackId);
    const { data: existingTrack, error: existingTrackError } = await supabase
      .from('stored_tracks')
      .select('*')
      .eq('track_id', trackId)
      .maybeSingle();

    if (existingTrackError) {
      console.error('Error checking existing track:', existingTrackError);
      throw existingTrackError;
    }

    if (existingTrack) {
      console.log('Track already exists, returning existing file path');
      return new Response(
        JSON.stringify({ filePath: existingTrack.file_path }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Construct search query and video URL directly
    const searchQuery = `${trackTitle} ${trackArtist} official audio`;
    const videoUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ`; // This is a placeholder. In production, you should implement proper YouTube search
    console.log('Using video URL:', videoUrl);

    // Download the audio using youtube_dl
    console.log('Downloading audio from YouTube...');
    const audioData = await download(videoUrl, {
      format: 'mp3',
      output: 'audio',
    });

    if (!audioData || !audioData.data) {
      throw new Error('Failed to download audio');
    }

    // Convert the audio data to Uint8Array
    const audioBuffer = new Uint8Array(audioData.data);

    // Generate a unique filename
    const fileName = `${crypto.randomUUID()}.mp3`;
    const filePath = `tracks/${fileName}`;

    console.log('Uploading to Supabase Storage:', filePath);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      throw uploadError;
    }

    // Store track information in the database
    const { error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: trackId,
        file_path: filePath,
        title: trackTitle,
        artist: trackArtist
      });

    if (dbError) {
      console.error('Error storing track info:', dbError);
      throw dbError;
    }

    console.log('Successfully processed track:', trackTitle);
    return new Response(
      JSON.stringify({ filePath }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});