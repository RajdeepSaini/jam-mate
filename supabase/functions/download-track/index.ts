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

    // Create a mock MP3 file with proper headers and data
    console.log('Creating mock audio file with proper MP3 structure')
    
    // Create a 2MB mock MP3 file
    const fileSize = 2 * 1024 * 1024 // 2MB
    const mockAudioData = new Uint8Array(fileSize)
    
    // Write MP3 header (ID3v2 tag)
    const header = new TextEncoder().encode('ID3')
    mockAudioData.set(header, 0) // 'ID3' magic number
    mockAudioData[3] = 0x03 // version
    mockAudioData[4] = 0x00 // revision
    mockAudioData[5] = 0x00 // flags
    
    // Set size (synchsafe integer)
    const size = fileSize - 10 // total size minus header
    mockAudioData[6] = (size >> 21) & 0x7F
    mockAudioData[7] = (size >> 14) & 0x7F
    mockAudioData[8] = (size >> 7) & 0x7F
    mockAudioData[9] = size & 0x7F

    // Add frame header (simple sine wave pattern)
    for (let i = 10; i < fileSize; i += 2) {
      const value = Math.sin((i - 10) / 100) * 127 + 128
      mockAudioData[i] = Math.floor(value)
      mockAudioData[i + 1] = Math.floor(value * 0.8)
    }

    console.log(`Created mock audio data of size: ${mockAudioData.length} bytes`)

    // Generate a unique filename
    const fileName = `${crypto.randomUUID()}.mp3`
    const filePath = `tracks/${fileName}`
    
    console.log('Uploading file to storage:', filePath)

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, mockAudioData, {
        contentType: 'audio/mpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw uploadError
    }

    console.log('File uploaded successfully, saving to database')

    // Save track information to database
    const { error: dbError } = await supabase
      .from('stored_tracks')
      .insert({
        track_id: trackId,
        file_path: filePath,
        title: trackTitle,
        artist: trackArtist,
        duration: 180, // Mock duration of 3 minutes
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})