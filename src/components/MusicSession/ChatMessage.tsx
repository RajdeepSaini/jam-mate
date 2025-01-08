import { ChatMessage as ChatMessageType } from "@/types/session";
import { format } from "date-fns";

interface ChatMessageProps {
  message: ChatMessageType;
  previousMessage?: ChatMessageType;
}

export const ChatMessage = ({ message, previousMessage }: ChatMessageProps) => {
  const showUserInfo = !previousMessage || previousMessage.userId !== message.userId;
  
  return (
    <div className="mb-1">
      {showUserInfo && (
        <div className="flex items-center gap-2 mt-4">
          <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center text-primary-foreground">
            {message.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="font-semibold">
            {message.displayName || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-400">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
        </div>
      )}
      <div className={`${showUserInfo ? '' : 'ml-10'}`}>
        <p className="text-sm">{message.message}</p>
      </div>
    </div>
  );
};