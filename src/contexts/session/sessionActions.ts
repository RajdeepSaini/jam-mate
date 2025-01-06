import { supabase } from "@/integrations/supabase/client";
import { Session } from "./types";
import { searchTracks as spotifySearchTracks } from "@/services/spotify";
import { Track } from "@/types/session";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function createSessionInMongoDB(
  name: string,
  isPublic: boolean,
  userId: string
): Promise<Session> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/session-management`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    },
    body: JSON.stringify({
      action: 'create',
      name,
      isPublic,
      userId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  const session = await response.json();
  return session;
}

export async function joinSessionInMongoDB(
  sessionId: string,
  userId: string
): Promise<Session> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/session-management`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    },
    body: JSON.stringify({
      action: 'join',
      sessionId,
      userId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to join session');
  }

  const session = await response.json();
  return session;
}

export async function leaveSessionInMongoDB(
  sessionId: string,
  userId: string
): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/session-management`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.getSession()}`
    },
    body: JSON.stringify({
      action: 'leave',
      sessionId,
      userId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to leave session');
  }
}

export async function searchTracksSpotify(query: string): Promise<Track[]> {
  return spotifySearchTracks(query);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user;
}