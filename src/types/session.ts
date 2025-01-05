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
  name: string;
  created_by: string;
  created_at: string;
  current_track: Track | null;
  is_playing: boolean;
  is_public: boolean;
  participants?: number;
}

export interface ChatMessage {
  id: string;
  sessionId: number;
  userId: string;
  message: string;
  timestamp: Date;
}