import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import ytdl from 'https://esm.sh/ytdl-core@4.11.5'

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
    const { trackId, trackTitle, trackArtist } = await req.json()

    if (!trackId || !trackTitle || !trackArtist) {
      throw new Error('Missing required track information')
    }

    console.log(`Processing track: ${trackTitle} by ${trackArtist} (ID: ${trackId})`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if track already exists in storage
    const { data: existingTrack } = await supabase
      .from('stored_tracks')
      .select('*')
      .eq('track_id', trackId)
      .single()

    if (existingTrack) {
      console.log('Track already exists in storage:', existingTrack)
      return new Response(
        JSON.stringify({ filePath: existingTrack.file_path }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Search for the track on YouTube
    const searchQuery = `${trackTitle} ${trackArtist} official audio`
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&key=${Deno.env.get('YOUTUBE_API_KEY')}&type=video&maxResults=1`
    
    console.log('Searching YouTube for:', searchQuery)
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (!searchData.items?.[0]?.id?.videoId) {
      throw new Error('No YouTube results found')
    }

    const videoId = searchData.items[0].id.videoId
    console.log('Found YouTube video:', videoId)

    // Get audio stream
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const info = await ytdl.getInfo(videoUrl)
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
    
    if (!audioFormat?.url) {
      throw new Error('No audio stream found')
    }

    // Download the audio
    console.log('Downloading audio stream')
    const audioResponse = await fetch(audioFormat.url)
    const audioBuffer = await audioResponse.arrayBuffer()
    
    // Generate file path and upload to storage
    const filePath = `tracks/${trackId}.mp3`
    console.log('Uploading to storage:', filePath)

    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw uploadError
    }

    // Save track information to database
    const { error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: trackId,
        file_path: filePath,
        title: trackTitle,
        artist: trackArtist,
        duration: Math.floor(info.videoDetails.lengthSeconds),
      })

    if (dbError) {
      console.error('Error saving to database:', dbError)
      throw dbError
    }

    console.log('Track saved successfully')

    return new Response(
      JSON.stringify({ filePath }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})