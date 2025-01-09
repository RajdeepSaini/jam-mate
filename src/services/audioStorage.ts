import { supabase } from "@/integrations/supabase/client";
import { Track } from "@/types/session";

export async function getStoredTrack(trackId: string) {
  const { data, error } = await supabase
    .from('stored_tracks')
    .select('*')
    .eq('track_id', trackId)
    .single();

  if (error) throw error;
  return data;
}

export async function uploadTrack(track: Track, audioBlob: Blob) {
  // First, check if track exists or create metadata
  const { data: response } = await supabase.functions.invoke('handle-audio-upload', {
    body: {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration
    }
  });

  if (response.message === 'Track already exists') {
    return response.track;
  }

  // Upload the actual audio file
  const { error: uploadError } = await supabase.storage
    .from('audio_files')
    .upload(response.uploadUrl, audioBlob, {
      contentType: 'audio/mpeg',
      upsert: false
    });

  if (uploadError) throw uploadError;
  return response.track;
}

export function getTrackUrl(filePath: string) {
  const { data } = supabase.storage
    .from('audio_files')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}