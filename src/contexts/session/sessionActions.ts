import { supabase } from "@/integrations/supabase/client";
import { Session, Track } from "@/types/session";
import { parseTrackData } from "@/utils/typeGuards";

export async function createSessionInMongoDB(
  name: string,
  isPublic: boolean,
  userId: string
): Promise<Session> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      name,
      code,
      created_by: userId,
      is_public: isPublic
    })
    .select('*')
    .single();

  if (error) throw error;

  // Also join the session as a participant
  const { error: participantError } = await supabase
    .from('session_participants')
    .insert({
      session_id: session.id,
      user_id: userId
    });

  if (participantError) throw participantError;

  return {
    id: session.id,
    name: session.name || '',
    code: session.code,
    created_by: session.created_by,
    is_public: session.is_public || false,
    current_track: null,
    is_playing: false,
    participants: [userId]
  };
}

export async function joinSessionInMongoDB(
  sessionId: string,
  userId: string
): Promise<Session> {
  // First, check if the session exists and is accessible
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      *,
      session_participants (
        user_id
      )
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError) throw new Error('Session not found or not accessible');

  // Check if user is already a participant
  const isAlreadyParticipant = session.session_participants.some(
    (p: { user_id: string }) => p.user_id === userId
  );

  if (!isAlreadyParticipant) {
    // Join the session
    const { error: joinError } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: userId
      });

    if (joinError) throw joinError;
  }

  // Get updated session data
  const { data: updatedSession, error: updateError } = await supabase
    .from('sessions')
    .select(`
      *,
      session_participants (
        user_id
      )
    `)
    .eq('id', sessionId)
    .single();

  if (updateError) throw updateError;

  const currentTrack = parseTrackData(updatedSession.current_track);

  return {
    id: updatedSession.id,
    name: updatedSession.name || '',
    code: updatedSession.code,
    created_by: updatedSession.created_by,
    is_public: updatedSession.is_public || false,
    current_track: currentTrack,
    is_playing: updatedSession.is_playing || false,
    participants: updatedSession.session_participants.map((p: { user_id: string }) => p.user_id)
  };
}

export async function leaveSessionInMongoDB(
  sessionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function searchTracksSpotify(query: string): Promise<Track[]> {
  // This will be implemented later when we integrate with Spotify
  return [];
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user;
}