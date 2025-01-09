import { Track } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";

export const searchYouTube = async (query: string): Promise<Track[]> => {
  const { data, error } = await supabase.functions.invoke('youtube-search', {
    body: { query }
  });

  if (error) throw error;

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    albumArt: item.snippet.thumbnails.high.url,
    duration: 0, // Duration will be fetched when downloading
  }));
};

export const downloadTrack = async (track: Track): Promise<void> => {
  const { error } = await supabase.functions.invoke('download-youtube', {
    body: {
      videoId: track.youtubeId,
      title: track.title,
      artist: track.artist,
    }
  });

  if (error) throw error;
};