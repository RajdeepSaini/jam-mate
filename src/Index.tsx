import { SessionList } from "@/components/MusicSession/SessionList";
import { useState } from "react";
import { Session } from "@/types/session";
import { toast } from "sonner";

const Index = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const handleJoinSession = (sessionId: number) => {
    // This is a placeholder function that will be implemented later
    toast.success(`Joining session ${sessionId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <SessionList 
        sessions={sessions} 
        onJoinSession={handleJoinSession}
      />
    </div>
  );
};

export default Index;