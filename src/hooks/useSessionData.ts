import { useState, useEffect } from "react";
import { Session } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";
import { formatSession } from "@/utils/sessionFormatters";
import { toast } from "sonner";

export const useSessionData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSessions = async () => {
    try {
      // First, fetch all public sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_public', true);

      if (sessionsError) throw sessionsError;

      // Then, for each session, fetch its participant count
      const sessionsWithCounts = await Promise.all(
        sessionsData.map(async (session) => {
          const { count, error: countError } = await supabase
            .from('session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          if (countError) {
            console.error('Error fetching participant count:', countError);
            return { ...session, participants: 0 };
          }

          return { ...session, participants: count || 0 };
        })
      );

      const formattedSessions = sessionsWithCounts.map(formatSession);
      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error("Failed to fetch sessions");
    }
  };

  const searchSessions = async (query: string) => {
    try {
      // First, fetch filtered sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_public', true)
        .ilike('name', `%${query}%`);

      if (sessionsError) throw sessionsError;

      // Then, fetch participant counts
      const sessionsWithCounts = await Promise.all(
        sessionsData.map(async (session) => {
          const { count, error: countError } = await supabase
            .from('session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          if (countError) {
            console.error('Error fetching participant count:', countError);
            return { ...session, participants: 0 };
          }

          return { ...session, participants: count || 0 };
        })
      );

      const formattedSessions = sessionsWithCounts.map(formatSession);
      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error searching sessions:', error);
      toast.error("Failed to search sessions");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { sessions, searchSessions };
};