import { useState } from 'react';
import { ChatMessage } from '@/types/session';

export const useSessionChat = (sessionId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId,
      userId: 'current-user',
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