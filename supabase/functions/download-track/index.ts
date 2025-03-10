
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Prepare the search query
    const searchQuery = `${trackTitle} ${trackArtist} audio`;
    console.log(`Searching for: ${searchQuery}`);
    
    // Create a temporary file for yt-dlp JSON output
    const tempJsonFile = await Deno.makeTempFile({ suffix: '.json' });
    
    // Use yt-dlp to search and get the best audio format
    // The --dump-json flag outputs metadata about the video
    const ytDlpCommand = new Deno.Command("yt-dlp", {
      args: [
        "ytsearch1:" + searchQuery,
        "--dump-json",
        "--no-playlist",
        "-o", tempJsonFile
      ]
    });
    
    const ytDlpResult = await ytDlpCommand.output();
    if (!ytDlpResult.success) {
      throw new Error(`yt-dlp search failed with status: ${ytDlpResult.code}`);
    }
    
    // Read the JSON output
    const jsonOutput = await Deno.readTextFile(tempJsonFile);
    const videoInfo = JSON.parse(jsonOutput);
    const videoId = videoInfo.id;
    
    if (!videoId) {
      throw new Error('No video found for this track');
    }
    
    console.log(`Found video with ID: ${videoId}`);
    
    // Create a temporary file for the audio download
    const tempAudioFile = await Deno.makeTempFile({ suffix: '.mp4' });
    
    // Use yt-dlp to download the best audio format
    const downloadCommand = new Deno.Command("yt-dlp", {
      args: [
        `https://www.youtube.com/watch?v=${videoId}`,
        "-f", "bestaudio[ext=m4a]/bestaudio",
        "-o", tempAudioFile,
        "--no-playlist"
      ]
    });
    
    const downloadResult = await downloadCommand.output();
    if (!downloadResult.success) {
      throw new Error(`yt-dlp download failed with status: ${downloadResult.code}`);
    }
    
    console.log(`Downloaded audio to temporary file: ${tempAudioFile}`);
    
    // Read the downloaded audio file
    const audioData = await Deno.readFile(tempAudioFile);
    
    // Generate a unique filename
    const fileName = `${trackId}-${crypto.randomUUID()}.mp4`;
    const filePath = `tracks/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, audioData, {
        contentType: 'audio/mp4',
        upsert: false
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    console.log(`Successfully uploaded track to: ${filePath}`);
    
    // Cleanup temporary files
    await Deno.remove(tempJsonFile);
    await Deno.remove(tempAudioFile);
    
    // Get the duration of the audio file (we could extract this from the yt-dlp JSON output as well)
    const duration = videoInfo.duration || 0;
    
    // Store track information in the database
    const { error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: trackId,
        file_path: filePath,
        title: trackTitle,
        artist: trackArtist,
        duration: Math.round(duration)
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
