import { useState, useEffect } from "react";
import { Session } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";
import { formatSession } from "@/utils/sessionFormatters";
import { toast } from "sonner";

export const useSessionData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          participant_count:session_participants!inner(count)
        `)
        .eq('is_public', true);

      if (sessionsError) throw sessionsError;

      const formattedSessions = sessionsData.map(session => {
        return formatSession({
          ...session,
          participants: session.participant_count?.[0]?.count || 0
        });
      });

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error("Failed to fetch sessions");
    }
  };

  const searchSessions = async (query: string) => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          participant_count:session_participants!inner(count)
        `)
        .eq('is_public', true)
        .ilike('name', `%${query}%`);

      if (sessionsError) throw sessionsError;

      const formattedSessions = sessionsData.map(session => {
        return formatSession({
          ...session,
          participants: session.participant_count?.[0]?.count || 0
        });
      });

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