import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as ChatMessageType } from "@/types/session";
import { useState } from "react";

interface ChatSectionProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => Promise<void>;
}

export const ChatSection = ({ messages, onSendMessage }: ChatSectionProps) => {
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      await onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  return (
    <div className="glass-morphism p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Session Chat</h2>
      </div>
      <div className="h-[calc(100vh-300px)] flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              previousMessage={index > 0 ? messages[index - 1] : undefined}
            />
          ))}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};