import { useState } from 'react';
import { ChatMessage } from '@/types/session';

export const useSessionChat = (sessionId: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId,
      userId: 'current-user', // TODO: Replace with actual user ID when auth is implemented
      message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return {
    messages,
    sendMessage,
  };
};