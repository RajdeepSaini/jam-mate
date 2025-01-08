import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/session';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSessionChat = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!sessionId) return;

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
          displayName: msg.profiles?.display_name || 'Unknown User'
        }))
      );
    };

    fetchMessages();

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
        async (payload) => {
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
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message:', error);
            return;
          }

          const newMessage: ChatMessage = {
            id: data.id,
            sessionId,
            userId: data.user_id,
            message: data.message,
            timestamp: new Date(data.created_at),
            displayName: data.profiles?.display_name || 'Unknown User'
          };
          
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const sendMessage = async (message: string) => {
    try {
      const { error } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          message: message.trim(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  return {
    messages,
    sendMessage,
  };
};