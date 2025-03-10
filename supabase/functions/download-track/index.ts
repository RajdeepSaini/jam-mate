
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { YouTube } from "https://deno.land/x/youtube@v0.3.0/mod.ts";

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
    const { data: existingTrack, error: checkError } = await supabase
      .from('stored_tracks')
      .select('*')
      .eq('track_id', trackId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingTrack) {
      console.log('Track already exists, returning existing file path')
      return new Response(
        JSON.stringify({ filePath: existingTrack.file_path }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create YouTube client
    const youtube = new YouTube(Deno.env.get('YOUTUBE_API_KEY') || '');

    // Search YouTube for the track
    console.log(`Searching YouTube for: ${trackTitle} ${trackArtist}`);
    const searchResults = await youtube.search(`${trackTitle} ${trackArtist} official audio`);
    
    if (!searchResults.length) {
      throw new Error('No YouTube results found for this track');
    }
    
    // Get the first result
    const videoId = searchResults[0].id;
    console.log(`Found video with ID: ${videoId}`);
    
    const videoInfo = await youtube.getVideo(videoId);
    
    if (!videoInfo || !videoInfo.html5player) {
      throw new Error('Could not get video details');
    }
    
    // Get the audio-only stream with highest quality
    let audioFormats = videoInfo.html5player.filter((format) => 
      format.mimeType?.includes('audio/mp4') && !format.mimeType?.includes('video')
    );
    
    if (!audioFormats.length) {
      // Fallback to any audio format
      audioFormats = videoInfo.html5player.filter((format) => 
        format.mimeType?.includes('audio')
      );
    }
    
    if (!audioFormats.length) {
      throw new Error('No audio formats found for this video');
    }
    
    // Sort by bitrate (descending) and get the best quality
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const bestAudioFormat = audioFormats[0];
    
    console.log(`Downloading audio with bitrate: ${bestAudioFormat.bitrate}`);
    
    // Download the audio
    const audioUrl = bestAudioFormat.url;
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
    }
    
    const audioData = await response.arrayBuffer();
    console.log(`Downloaded ${audioData.byteLength} bytes of audio data`);

    // Generate a unique filename
    const fileName = `${trackId}-${crypto.randomUUID()}.mp4`;
    const filePath = `tracks/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, new Uint8Array(audioData), {
        contentType: 'audio/mp4',
        upsert: false
      })

    if (uploadError) {
      throw uploadError;
    }

    console.log(`Successfully uploaded track to: ${filePath}`);

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
      throw dbError;
    }

    console.log('Successfully saved track information to database');

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
