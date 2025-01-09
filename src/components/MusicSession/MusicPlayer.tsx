import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Volume2, ListMusic } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Track } from "@/types/session";
import { getStoredTrack, getTrackUrl } from "@/services/audioStorage";
import { toast } from "sonner";

interface MusicPlayerProps {
  currentTrack?: {
    title: string;
    artist: string;
    albumArt: string;
    id: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  queue?: Track[];
}

export const MusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  queue = [],
}: MusicPlayerProps) => {
  const [volume, setVolume] = useState([100]);
  const [progress, setProgress] = useState([0]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentTrack?.id) {
      loadTrack(currentTrack.id);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Playback failed:', error);
          toast.error('Failed to play track');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const loadTrack = async (trackId: string) => {
    try {
      const storedTrack = await getStoredTrack(trackId);
      const url = getTrackUrl(storedTrack.file_path);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to load track:', error);
      toast.error('Failed to load track');
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress([percentage]);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && audioRef.current.duration) {
      const time = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(value);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 animate-slide-up">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />
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
            value={progress}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="w-[400px]"
          />
        </div>

        <div className="flex items-center gap-4">
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ListMusic className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Queue</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                <div className="space-y-4">
                  {queue.map((track, index) => (
                    <div key={track.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
                      <img src={track.albumArt} alt={track.title} className="h-12 w-12 rounded" />
                      <div>
                        <h4 className="font-medium">{track.title}</h4>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};