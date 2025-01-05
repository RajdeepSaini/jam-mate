import { useState, useEffect } from "react";
import { Session } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";
import { formatSession } from "@/utils/sessionFormatters";
import { toast } from "sonner";

export const useSessionData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

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

      const formattedSessions = data.map(formatSession);
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