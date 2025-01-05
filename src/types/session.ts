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
  name: string;
  code: string;
  created_by: string;
  is_public: boolean;
  current_track?: Track;
  is_playing?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  timestamp: Date;
}