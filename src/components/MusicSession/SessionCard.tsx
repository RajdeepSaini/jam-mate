import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Lock } from "lucide-react";

interface SessionCardProps {
  name: string;
  participants: number;
  currentTrack?: string;
  onJoin: () => void;
  isPublic: boolean;
}

export const SessionCard = ({ name, participants, currentTrack, onJoin, isPublic }: SessionCardProps) => {
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
            {participants}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-400">
          {currentTrack || "No track playing"}
        </CardDescription>
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