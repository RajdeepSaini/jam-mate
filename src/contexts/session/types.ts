import { Track } from "@/types/session";

export interface SessionState {
  currentSession: Session | null;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export interface Session {
  id: string;
  name: string;
  code: string;
  created_by: string;
  is_public: boolean;
  current_track?: Track | null;
  is_playing?: boolean;
  participants?: string[];
}

export interface MusicSessionContextType extends SessionState {
  createSession: (name: string, isPublic: boolean) => Promise<string>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => void;
  setIsPlaying: (playing: boolean) => void;
  searchTracks: (query: string) => Promise<Track[]>;
}