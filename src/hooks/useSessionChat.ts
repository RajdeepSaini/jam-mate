import { useState } from 'react';
import { ChatMessage } from '@/types/session';

export const useSessionChat = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
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