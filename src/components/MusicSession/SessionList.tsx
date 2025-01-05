import { SessionCard } from "./SessionCard";
import { Session } from "@/types/session";
import { Loader } from "lucide-react";

interface SessionListProps {
  sessions: Session[];
  onJoinSession: (sessionId: string) => void;
}

export const SessionList = ({ sessions, onJoinSession }: SessionListProps) => {
  if (!sessions) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No sessions available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          name={session.name || 'Unnamed Session'}
          participants={session.participants || 0}
          currentTrack={session.current_track?.title}
          onJoin={() => onJoinSession(session.id)}
          isPublic={session.is_public || false}
          sessionId={session.id}
        />
      ))}
    </div>
  );
};