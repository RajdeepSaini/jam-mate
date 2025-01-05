import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, Track } from "@/types/session";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { searchTracks as spotifySearchTracks } from "@/services/spotify";
import { supabase } from "@/integrations/supabase/client";
import { useSessionStore } from "@/stores/sessionStore";
import { nanoid } from 'nanoid';
import { formatSession } from "@/utils/sessionFormatters";
import { useSessionData } from "@/hooks/useSessionData";

interface MusicSessionContextType {
  currentSession: Session | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  sessions: Session[];
  createSession: (name: string, isPublic: boolean) => Promise<string>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
  searchTracks: (query: string) => Promise<Track[]>;
  searchSessions: (query: string) => Promise<void>;
}

const MusicSessionContext = createContext<MusicSessionContextType | undefined>(undefined);

export const MusicSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setActiveSession } = useSessionStore();
  const { sessions, searchSessions } = useSessionData();

  const createSession = async (name: string, isPublic: boolean) => {
    try {
      const sessionCode = nanoid(6);
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          name,
          is_public: isPublic,
          code: sessionCode,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      const formattedSession = formatSession(session);
      setCurrentSession(formattedSession);
      setActiveSession(session.id);
      toast.success("Session created successfully!");
      return session.id;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error("Failed to create session");
      throw error;
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { error: joinError } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId
        });

      if (joinError) throw joinError;

      const formattedSession = formatSession(session);
      setCurrentSession(formattedSession);
      setActiveSession(session.id);
      toast.success(`Joined session: ${session.name}`);
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error("Failed to join session");
      throw error;
    }
  };

  const leaveSession = async () => {
    if (!currentSession) return;

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { error } = await supabase
        .from('session_participants')
        .delete()
        .match({ 
          session_id: currentSession.id,
          user_id: userId
        });

      if (error) throw error;

      setCurrentSession(null);
      setCurrentTrack(null);
      setIsPlaying(false);
      setActiveSession(null);
      navigate('/');
      toast.success("Left session successfully");
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error("Failed to leave session");
    }
  };

  const searchTracks = async (query: string): Promise<Track[]> => {
    try {
      const tracks = await spotifySearchTracks(query);
      return tracks;
    } catch (error) {
      console.error("Error searching tracks:", error);
      toast.error("Failed to search tracks");
      return [];
    }
  };

  useEffect(() => {
    if (!currentSession) return;

    const channel = supabase
      .channel(`session:${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${currentSession.id}`
        },
        (payload) => {
          if (payload.new) {
            const formattedSession = formatSession(payload.new);
            setCurrentSession(formattedSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession]);

  return (
    <MusicSessionContext.Provider
      value={{
        currentSession,
        currentTrack,
        isPlaying,
        sessions,
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