export interface Track {
  title: string;
  artist: string;
  albumArt: string;
}

export interface Session {
  id: number;
  name: string;
  participants: number;
  currentTrack?: string;
  isPublic: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: number;
  userId: string;
  message: string;
  timestamp: Date;
}