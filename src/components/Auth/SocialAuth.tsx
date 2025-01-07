import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

export const SocialAuth = () => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-music-gray" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-music-dark px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Button variant="outline" className="bg-music-gray/50 border-music-gray">
          <Music2 className="mr-2 h-4 w-4" />
          Spotify
        </Button>
      </div>
    </div>
  );
};