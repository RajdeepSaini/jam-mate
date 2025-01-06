import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MusicSessionContextType, SessionState } from "./session/types";
import { 
  createSessionInMongoDB, 
  joinSessionInMongoDB, 
  leaveSessionInMongoDB,
  searchTracksSpotify,
  getCurrentUser
} from "./session/sessionActions";

const MusicSessionContext = createContext<MusicSessionContextType | undefined>(undefined);

export const MusicSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<SessionState>({
    currentSession: null,
    currentTrack: null,
    isPlaying: false,
  });

  const createSession = async (name: string, isPublic: boolean) => {
    try {
      const user = await getCurrentUser();
      const session = await createSessionInMongoDB(name, isPublic, user.id);
      
      setState(prev => ({
        ...prev,
        currentSession: session,
      }));

      navigate(`/session/${session.id}`);
      toast({
        title: "Session Created",
        description: `Session code: ${session.code}`,
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
      const user = await getCurrentUser();
      const session = await joinSessionInMongoDB(sessionId, user.id);
      
      setState(prev => ({
        ...prev,
        currentSession: session,
      }));

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
    if (state.currentSession?.id) {
      try {
        const user = await getCurrentUser();
        await leaveSessionInMongoDB(state.currentSession.id, user.id);
        
        setState({
          currentSession: null,
          currentTrack: null,
          isPlaying: false,
        });
        
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

  const setIsPlaying = (playing: boolean) => {
    setState(prev => ({ ...prev, isPlaying: playing }));
  };

  const searchTracks = async (query: string) => {
    try {
      return await searchTracksSpotify(query);
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
        ...state,
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