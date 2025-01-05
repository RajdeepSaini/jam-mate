import React, { createContext, useContext, useState } from "react";
import { Session, Track } from "@/types/session";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { searchTracks as spotifySearchTracks } from "@/services/spotify";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MusicSessionContextType {
  currentSession: Session | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  createSession: (name: string, isPublic: boolean) => Promise<string>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => void;
  setIsPlaying: (playing: boolean) => void;
  searchTracks: (query: string) => Promise<Track[]>;
}

const MusicSessionContext = createContext<MusicSessionContextType | undefined>(undefined);

export const MusicSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const createSession = async (name: string, isPublic: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          name,
          is_public: isPublic,
          created_by: user.id,
          code,
        })
        .select()
        .single();

      if (error) throw error;

      // Join the session as the creator
      await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          user_id: user.id,
        });

      const sessionData: Session = {
        id: session.id,
        name: session.name,
        code: session.code,
        created_by: session.created_by,
        is_public: session.is_public,
        current_track: session.current_track ? JSON.parse(session.current_track as string) as Track : null,
        is_playing: session.is_playing,
        participants: [],
      };

      setCurrentSession(sessionData);
      navigate(`/session/${session.id}`);
      toast({
        title: "Session Created",
        description: `Session code: ${code}`,
      });
      return session.id;
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
      throw error;
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if session exists
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw new Error("Session not found");

      // Join the session
      const { error: joinError } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
        });

      if (joinError) throw joinError;

      setCurrentSession(session);
      navigate(`/session/${sessionId}`);
      toast({
        title: "Session Joined",
        description: `You've joined ${session.name}`,
      });
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
      throw error;
    }
  };

  const leaveSession = async () => {
    if (currentSession) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        await supabase
          .from('session_participants')
          .delete()
          .match({ session_id: currentSession.id, user_id: user.id });

        setCurrentSession(null);
        setCurrentTrack(null);
        setIsPlaying(false);
        navigate('/');
        toast({
          title: "Session Left",
          description: "You've left the session",
        });
      } catch (error) {
        console.error("Error leaving session:", error);
        toast({
          title: "Error",
          description: "Failed to leave session",
          variant: "destructive",
        });
      }
    }
  };

  const searchTracks = async (query: string): Promise<Track[]> => {
    try {
      const tracks = await spotifySearchTracks(query);
      return tracks;
    } catch (error) {
      console.error("Error searching tracks:", error);
      toast({
        title: "Error",
        description: "Failed to search tracks",
        variant: "destructive",
      });
      return [];
    }
  };

  return (
    <MusicSessionContext.Provider
      value={{
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