export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration?: number;
  uri?: string;
}

export interface Session {
  id: string;
  code: string;
  name: string | null;
  created_by: string;
  created_at: string | null;
  current_track: Track | null;
  is_playing: boolean | null;
  is_public: boolean | null;
  participants?: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  timestamp: Date;
}