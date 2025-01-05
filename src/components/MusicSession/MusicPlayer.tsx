import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

interface MusicPlayerProps {
  currentTrack?: {
    title: string;
    artist: string;
    albumArt: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const MusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}: MusicPlayerProps) => {
  const [volume, setVolume] = useState([100]);

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentTrack && (
            <>
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="h-14 w-14 rounded-md"
              />
              <div>
                <h3 className="font-semibold">{currentTrack.title}</h3>
                <p className="text-sm text-gray-400">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="text-gray-400 hover:text-white"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              className="h-10 w-10 rounded-full bg-music-primary hover:bg-music-accent text-white"
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
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <Slider
            defaultValue={[0]}
            max={100}
            step={1}
            className="w-[400px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="w-[100px]"
          />
        </div>
      </div>
    </div>
  );
};