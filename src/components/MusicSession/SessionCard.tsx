import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Lock, Copy } from "lucide-react";
import { toast } from "sonner";
import { Track } from "@/types/session";

interface SessionCardProps {
  name: string;
  participants: string[];
  currentTrack?: Track | null;
  onJoin: () => void;
  isPublic: boolean;
  sessionId: string;
}

export const SessionCard = ({ name, participants, currentTrack, onJoin, isPublic, sessionId }: SessionCardProps) => {
  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast.success("Session ID copied to clipboard");
  };

  return (
    <Card className="glass-morphism hover-scale">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            {isPublic ? (
              <Globe className="h-4 w-4 text-gray-400" />
            ) : (
              <Lock className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participants.length}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-400">
          {currentTrack?.title || "No track playing"}
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">ID: {sessionId}</span>
          <Button variant="ghost" size="icon" onClick={copySessionId}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onJoin}
          className="w-full bg-music-primary hover:bg-music-accent text-white"
        >
          Join Session
        </Button>
      </CardContent>
    </Card>
  );
};