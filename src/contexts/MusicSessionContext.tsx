import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, Track } from "@/types/session";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { searchTracks as spotifySearchTracks } from "@/services/spotify";
import { supabase } from "@/integrations/supabase/client";
import { useSessionStore } from "@/stores/sessionStore";
import { nanoid } from 'nanoid';

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const { setActiveSession } = useSessionStore();

  const formatSession = (session: any): Session => {
    let parsedTrack: Track | null = null;
    if (session.current_track) {
      try {
        const trackData = typeof session.current_track === 'string' 
          ? JSON.parse(session.current_track) 
          : session.current_track;
        
        if (trackData) {
          parsedTrack = {
            id: trackData.id || '',
            title: trackData.title || '',
            artist: trackData.artist || '',
            albumArt: trackData.albumArt || '',
            duration: trackData.duration,
            uri: trackData.uri
          };
        }
      } catch (e) {
        console.error('Error parsing track data:', e);
      }
    }

    return {
      id: session.id,
      code: session.code,
      name: session.name,
      created_by: session.created_by,
      created_at: session.created_at,
      current_track: parsedTrack,
      is_playing: session.is_playing || false,
      is_public: session.is_public || false,
      participants: session.session_participants?.[0]?.count || 0
    };
  };

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select(`
          *,
          session_participants (
            count
          )
        `)
        .eq('is_public', true);

      if (error) throw error;

      const formattedSessions = sessionsData.map(formatSession);
      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error("Failed to fetch sessions");
    }
  };

  const searchSessions = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          session_participants (
            count
          )
        `)
        .eq('is_public', true)
        .ilike('name', `%${query}%`);

      if (error) throw error;

      const formattedSessions = data.map(session => ({
        ...session,
        participants: session.session_participants?.[0]?.count || 0
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error searching sessions:', error);
      toast.error("Failed to search sessions");
    }
  };

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

      // Join the session as the creator
      await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      setCurrentSession(session);
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

      setCurrentSession(formatSession(session));
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

  // Subscribe to real-time session updates
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
          console.log('Session updated:', payload);
          if (payload.new) {
            setCurrentSession(formatSession(payload.new));
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