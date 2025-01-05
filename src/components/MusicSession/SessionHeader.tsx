import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface SessionHeaderProps {
  sessionId: string;
}

export const SessionHeader = ({ sessionId }: SessionHeaderProps) => {
  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast.success("Session ID copied to clipboard");
  };

  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-music-gray rounded-lg">
      <div>
        <h2 className="text-xl font-bold">Current Session</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-400">Session ID: {sessionId}</span>
          <Button variant="ghost" size="sm" onClick={copySessionId}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};