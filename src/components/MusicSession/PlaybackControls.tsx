
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  hasQueue: boolean;
}

export const PlaybackControls = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  isLoading,
  hasQueue
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="text-gray-400 hover:text-white"
        disabled={isLoading}
      >
        <SkipBack className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPlayPause}
        className="h-10 w-10 rounded-full bg-music-primary hover:bg-music-accent text-white"
        disabled={isLoading}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="text-gray-400 hover:text-white"
        disabled={isLoading || !hasQueue}
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
};
