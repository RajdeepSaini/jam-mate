import React, { createContext, useContext, useState } from "react";
import { Session, Track } from "@/types/session";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface MusicSessionContextType {
  sessions: Session[];
  currentSession: Session | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  createSession: (name: string, isPublic: boolean) => number;
  joinSession: (sessionId: number) => void;
  leaveSession: () => void;
  setIsPlaying: (playing: boolean) => void;
  searchTracks: (query: string) => Promise<void>;
  searchSessions: (query: string) => void;
}

const MusicSessionContext = createContext<MusicSessionContextType | undefined>(undefined);

export const MusicSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, name: "Chill Vibes", participants: 5, currentTrack: "Blinding Lights - The Weeknd", isPublic: true },
    { id: 2, name: "Rock Classics", participants: 3, currentTrack: "Sweet Child O' Mine - Guns N' Roses", isPublic: true },
    { id: 3, name: "Study Session", participants: 8, currentTrack: "Lo-fi beats", isPublic: false },
  ]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const createSession = (name: string, isPublic: boolean) => {
    const newSession = {
      id: Math.floor(Math.random() * 10000),
      name,
      participants: 1,
      isPublic,
    };
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    navigate(`/session/${newSession.id}`);
    toast({
      title: "Session Created",
      description: `Session ID: ${newSession.id}`,
    });
    return newSession.id;
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
      navigate(`/session/${sessionId}`);
      toast({
        title: "Session Joined",
        description: `You've joined ${session.name}`,
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
      navigate('/');
      toast({
        title: "Session Left",
        description: "You've left the session",
      });
    }
  };

  const searchTracks = async (query: string) => {
    console.log("Searching for tracks:", query);
    // TODO: Implement Spotify search
  };

  const searchSessions = (query: string) => {
    console.log("Searching for sessions:", query);
    // TODO: Implement session search
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
        searchSessions,
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