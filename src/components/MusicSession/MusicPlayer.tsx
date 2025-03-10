
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Track } from "@/types/session";
import { PlaybackControls } from "./PlaybackControls";
import { VolumeControl } from "./VolumeControl";
import { TrackInfo } from "./TrackInfo";
import { QueueDrawer } from "./QueueDrawer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface MusicPlayerProps {
  currentTrack?: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  queue?: Track[];
  onPlayTrackFromQueue?: (track: Track) => void;
}

export const MusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  queue = [],
  onPlayTrackFromQueue,
}: MusicPlayerProps) => {
  const [volume, setVolume] = useState([100]);
  
  const { 
    isLoading, 
    progress, 
    handleProgressChange 
  } = useAudioPlayer(currentTrack, isPlaying, volume);

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-[240px]">
          <TrackInfo currentTrack={currentTrack} />
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px]">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onNext={handleNext}
            onPrevious={onPrevious}
            isLoading={isLoading}
            hasQueue={queue.length > 0}
          />
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-4 min-w-[200px] justify-end">
          <VolumeControl volume={volume} onVolumeChange={setVolume} />
          <QueueDrawer queue={queue} onPlayTrackFromQueue={onPlayTrackFromQueue} />
        </div>
      </div>
    </div>
  );
};
