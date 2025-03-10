
import { supabase } from "@/integrations/supabase/client";
import { Track } from "@/types/session";

export const downloadTrack = async (track: Track): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('download-track', {
      body: {
        trackId: track.id,
        trackTitle: track.title,
        trackArtist: track.artist
      }
    });

    if (error) throw error;
    return data.filePath;
  } catch (error) {
    console.error('Error downloading track:', error);
    throw error;
  }
};

export const getStoredTrack = async (trackId: string) => {
  const { data, error } = await supabase
    .from('stored_tracks')
    .select('*')
    .eq('track_id', trackId)
    .single();

  if (error) throw error;
  return data;
};

export const getTrackUrl = async (filePath: string) => {
  const { data } = await supabase.storage
    .from('audio_files')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
