import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/session';
import { supabase } from '@/integrations/supabase/client';

export const useSessionChat = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('session_messages')
        .select(`
          id,
          message,
          created_at,
          user_id,
          profiles (
            display_name
          )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(
        data.map((msg) => ({
          id: msg.id,
          sessionId,
          userId: msg.user_id,
          message: msg.message,
          timestamp: new Date(msg.created_at),
        }))
      );
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('session_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage: ChatMessage = {
            id: payload.new.id,
            sessionId,
            userId: payload.new.user_id,
            message: payload.new.message,
            timestamp: new Date(payload.new.created_at),
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return {
    messages,
  };
};