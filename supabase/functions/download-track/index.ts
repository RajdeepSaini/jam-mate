
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trackTitle, trackArtist, trackId } = await req.json()
    console.log(`Downloading track: ${trackTitle} by ${trackArtist}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

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
    
    // Create a temporary file for yt-dlp command output
    const tempOutputFile = await Deno.makeTempFile({ suffix: '.json' });
    
    try {
      // Use yt-dlp to search and get metadata
      const ytDlpSearchCommand = new Deno.Command("yt-dlp", {
        args: [
          "ytsearch1:" + searchQuery,
          "--dump-single-json",
          "--no-playlist"
        ],
        stdout: "piped",
        stderr: "piped"
      });
      
      const ytDlpSearchOutput = await ytDlpSearchCommand.output();
      
      if (!ytDlpSearchOutput.success) {
        const errorText = new TextDecoder().decode(ytDlpSearchOutput.stderr);
        console.error("yt-dlp search failed:", errorText);
        throw new Error(`yt-dlp search failed: ${errorText}`);
      }
      
      // Parse the JSON output
      const jsonOutput = new TextDecoder().decode(ytDlpSearchOutput.stdout);
      const searchResult = JSON.parse(jsonOutput);
      
      if (!searchResult.entries || searchResult.entries.length === 0) {
        throw new Error('No videos found for this track');
      }
      
      const videoInfo = searchResult.entries[0];
      const videoId = videoInfo.id;
      
      if (!videoId) {
        throw new Error('Invalid video ID in search results');
      }
      
      console.log(`Found video with ID: ${videoId}, title: ${videoInfo.title}`);
      
      // Create a temporary file for the audio download
      const tempAudioFile = await Deno.makeTempFile({ suffix: '.m4a' });
      
      // Use yt-dlp to download the best audio format
      const downloadCommand = new Deno.Command("yt-dlp", {
        args: [
          `https://www.youtube.com/watch?v=${videoId}`,
          "-f", "bestaudio[ext=m4a]/bestaudio",
          "-o", tempAudioFile,
          "--no-playlist"
        ],
        stdout: "piped",
        stderr: "piped"
      });
      
      const downloadResult = await downloadCommand.output();
      
      if (!downloadResult.success) {
        const errorText = new TextDecoder().decode(downloadResult.stderr);
        console.error("yt-dlp download failed:", errorText);
        throw new Error(`yt-dlp download failed: ${errorText}`);
      }
      
      console.log(`Downloaded audio to temporary file: ${tempAudioFile}`);
      
      // Read the downloaded audio file
      const audioData = await Deno.readFile(tempAudioFile);
      
      // Generate a unique filename
      const fileName = `${trackId}-${crypto.randomUUID()}.m4a`;
      const filePath = `tracks/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio_files')
        .upload(filePath, audioData, {
          contentType: 'audio/m4a',
          upsert: false
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log(`Successfully uploaded track to: ${filePath}`);
      
      // Cleanup temporary files
      try {
        await Deno.remove(tempOutputFile);
        await Deno.remove(tempAudioFile);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary files:", cleanupError);
      }
      
      // Get the duration of the audio file
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
        });
      
      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
      
      console.log('Successfully saved track information to database');
      
      return new Response(
        JSON.stringify({ filePath }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('yt-dlp processing error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
