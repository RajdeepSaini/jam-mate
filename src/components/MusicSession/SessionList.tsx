import { SessionCard } from "./SessionCard";
import { Session } from "@/types/session";

interface SessionListProps {
  sessions: Session[];
  onJoinSession: (sessionId: string) => void;
}

export const SessionList = ({ sessions, onJoinSession }: SessionListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          name={session.name}
          participants={session.participants || []}
          currentTrack={session.current_track}
          onJoin={() => onJoinSession(session.id)}
          isPublic={session.is_public}
          sessionId={session.id}
        />
      ))}
    </div>
  );
};