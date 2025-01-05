import { Session, Track } from "@/types/session";
import { Json } from "@/integrations/supabase/types";

export const formatTrackData = (trackData: Json | null): Track | null => {
  if (!trackData) return null;

  try {
    const parsed = typeof trackData === 'string' ? JSON.parse(trackData) : trackData;
    
    if (!parsed) return null;

    return {
      id: parsed.id || '',
      title: parsed.title || '',
      artist: parsed.artist || '',
      albumArt: parsed.albumArt || '',
      duration: parsed.duration || 0,
      uri: parsed.uri || ''
    };
  } catch (e) {
    console.error('Error parsing track data:', e);
    return null;
  }
};

export const formatSession = (session: any): Session => {
  return {
    id: session.id,
    code: session.code,
    name: session.name || null,
    created_by: session.created_by,
    created_at: session.created_at,
    current_track: formatTrackData(session.current_track),
    is_playing: session.is_playing || false,
    is_public: session.is_public || false,
    participants: session.session_participants?.[0]?.count || 0
  };
};