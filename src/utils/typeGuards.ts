import { Track } from "@/types/session";
import { Json } from "@/integrations/supabase/types";

export const isTrackData = (data: unknown): data is Track => {
  if (!data || typeof data !== 'object') return false;
  const track = data as any;
  return (
    typeof track.id === 'string' &&
    typeof track.title === 'string' &&
    typeof track.artist === 'string' &&
    typeof track.albumArt === 'string'
  );
};

export const parseTrackData = (data: Json | null): Track | null => {
  if (!data) return null;
  
  // If it's a string, try to parse it
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return isTrackData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  
  // If it's already an object, check if it matches Track shape
  return isTrackData(data) ? data : null;
};