import { getSessionsCollection } from "@/integrations/mongodb/client";
import { Session } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { searchTracks as spotifySearchTracks } from "@/services/spotify";
import { Track } from "@/types/session";

export async function createSessionInMongoDB(
  name: string,
  isPublic: boolean,
  userId: string
): Promise<Session> {
  const sessions = await getSessionsCollection();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const session: Session = {
    name,
    code,
    created_by: userId,
    is_public: isPublic,
    is_playing: false,
    participants: [userId],
  };

  const result = await sessions.insertOne(session);
  return { ...session, _id: result.insertedId.toString() };
}

export async function joinSessionInMongoDB(
  sessionId: string,
  userId: string
): Promise<Session> {
  const sessions = await getSessionsCollection();
  const session = await sessions.findOneAndUpdate(
    { _id: sessionId },
    { $addToSet: { participants: userId } },
    { returnDocument: 'after' }
  );
  
  if (!session) {
    throw new Error("Session not found");
  }
  
  return session;
}

export async function leaveSessionInMongoDB(
  sessionId: string,
  userId: string
): Promise<void> {
  const sessions = await getSessionsCollection();
  await sessions.updateOne(
    { _id: sessionId },
    { $pull: { participants: userId } }
  );
}

export async function searchTracksSpotify(query: string): Promise<Track[]> {
  return spotifySearchTracks(query);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user;
}