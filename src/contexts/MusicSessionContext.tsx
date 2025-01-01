import React, { createContext, useContext, useState, useEffect } from "react";

interface Track {
  title: string;
  artist: string;
  albumArt: string;
}

interface Session {
  id: number;
  name: string;
  participants: number;
  currentTrack?: string;
}

interface MusicSessionContextType {
  sessions: Session[];
  currentSession: Session | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  createSession: (name: string) => void;
  joinSession: (sessionId: number) => void;
  leaveSession: () => void;
  setIsPlaying: (playing: boolean) => void;
  searchTracks: (query: string) => Promise<void>;
}

const MusicSessionContext = createContext<MusicSessionContextType | undefined>(undefined);

export const MusicSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, name: "Chill Vibes", participants: 5, currentTrack: "Blinding Lights - The Weeknd" },
    { id: 2, name: "Rock Classics", participants: 3, currentTrack: "Sweet Child O' Mine - Guns N' Roses" },
    { id: 3, name: "Study Session", participants: 8, currentTrack: "Lo-fi beats" },
  ]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const createSession = (name: string) => {
    const newSession = {
      id: sessions.length + 1,
      name,
      participants: 1,
    };
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
  };

  const joinSession = (sessionId: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      const updatedSession = { ...session, participants: session.participants + 1 };
      setSessions(sessions.map((s) => (s.id === sessionId ? updatedSession : s)));
      setCurrentSession(updatedSession);
      setCurrentTrack({
        title: "Blinding Lights",
        artist: "The Weeknd",
        albumArt: "https://via.placeholder.com/56",
      });
    }
  };

  const leaveSession = () => {
    if (currentSession) {
      const updatedSession = { ...currentSession, participants: currentSession.participants - 1 };
      setSessions(sessions.map((s) => (s.id === currentSession.id ? updatedSession : s)));
      setCurrentSession(null);
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const searchTracks = async (query: string) => {
    console.log("Searching for tracks:", query);
    // TODO: Implement actual search functionality
  };

  return (
    <MusicSessionContext.Provider
      value={{
        sessions,
        currentSession,
        currentTrack,
        isPlaying,
        createSession,
        joinSession,
        leaveSession,
        setIsPlaying,
        searchTracks,
      }}
    >
      {children}
    </MusicSessionContext.Provider>
  );
};

export const useMusicSession = () => {
  const context = useContext(MusicSessionContext);
  if (context === undefined) {
    throw new Error("useMusicSession must be used within a MusicSessionProvider");
  }
  return context;
};